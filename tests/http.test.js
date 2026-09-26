import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import axios from 'axios';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer as createViteServer } from 'vite';

let vite, server, baseURL, httpRequest, HttpError, useHttp, AuthContext;

before(async () => {
  server = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    response.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/disconnect') return request.socket.destroy();
    if (url.pathname === '/slow') return;
    if (url.pathname === '/empty') {
      response.writeHead(204);
      return response.end();
    }
    if (url.pathname === '/text') {
      response.setHeader('Content-Type', 'text/plain');
      return response.end('export complete');
    }
    if (url.pathname === '/invalid') {
      response.writeHead(Number(url.searchParams.get('status') || 200));
      return response.end('{invalid');
    }
    if (url.pathname === '/error') {
      response.writeHead(Number(url.searchParams.get('status')));
      return response.end(JSON.stringify({ message: 'Request rejected', detail: 'kept' }));
    }
    if (url.pathname === '/api/surveys/dashboard') {
      return response.end(JSON.stringify({
        summary: {}, submissions: { items: [], page: Number(url.searchParams.get('page')), pageSize: Number(url.searchParams.get('size')) },
      }));
    }
    let body = '';
    for await (const chunk of request) body += chunk;
    response.end(JSON.stringify({
      method: request.method, path: url.pathname, query: Object.fromEntries(url.searchParams),
      headers: request.headers, body: body ? JSON.parse(body) : null,
    }));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseURL = `http://127.0.0.1:${server.address().port}`;
  vite = await createViteServer({ server: { middlewareMode: true, watch: null, hmr: false } });
  ({ httpRequest, HttpError } = await vite.ssrLoadModule('/src/services/httpService.js'));
  ({ useHttp } = await vite.ssrLoadModule('/src/hooks/useHttp.js'));
  ({ AuthContext } = await vite.ssrLoadModule('/src/context/AuthContext.jsx'));
});

after(async () => {
  await vite?.close();
  server?.closeAllConnections();
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
});

const request = (url, options) => httpRequest(url, { baseURL, proxy: false, ...options });

function authenticatedRequest(value) {
  let send;
  function Capture() {
    // oxlint-disable-next-line react/globals -- Expose the hook only within this server-rendered test harness.
    send = useHttp();
    return null;
  }
  renderToStaticMarkup(createElement(AuthContext.Provider, { value }, createElement(Capture)));
  return (url, options) => send(url, { baseURL, proxy: false, ...options });
}

test('serializes JSON and query parameters, unwraps data and preserves headers', async () => {
  const result = await request('/echo', {
    method: 'POST', data: { title: 'پیمایش' }, params: { search: 'a & b' },
    token: 'first', headers: { authorization: 'Bearer override', 'X-Trace': 'test' },
  });
  assert.equal(result.method, 'POST');
  assert.deepEqual(result.body, { title: 'پیمایش' });
  assert.deepEqual(result.query, { search: 'a & b' });
  assert.equal(result.headers.authorization, 'Bearer override');
  assert.equal(result.headers['content-type'], 'application/json');
  assert.equal(result.headers['x-trace'], 'test');
});

test('keeps bearer tokens per request without leaking them to later calls', async () => {
  assert.equal((await request('/echo', { token: 'first' })).headers.authorization, 'Bearer first');
  assert.equal((await request('/echo', { token: 'second' })).headers.authorization, 'Bearer second');
  assert.equal((await request('/echo')).headers.authorization, undefined);
});

test('supports empty responses and explicit text responses', async () => {
  assert.equal(await request('/empty', { method: 'DELETE' }), null);
  assert.equal(await request('/text', { responseType: 'text' }), 'export complete');
});

test('preserves server status, message and error data', async () => {
  for (const status of [400, 401, 404, 500]) {
    await assert.rejects(request('/error', { params: { status } }), (error) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, status);
      assert.equal(error.message, 'Request rejected');
      assert.equal(error.data.detail, 'kept');
      return true;
    });
  }
});

test('rejects malformed JSON while retaining its HTTP status', async () => {
  for (const status of [200, 401, 500]) {
    await assert.rejects(request('/invalid', { params: { status } }), (error) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, status);
      assert.match(error.message, /JSON/);
      assert.equal(error.data, null);
      return true;
    });
  }
});

test('normalizes network failures to status zero', async () => {
  await assert.rejects(request('/disconnect'), { name: 'HttpError', status: 0, data: null });
});

test('retains Axios cancellation for pre-aborted and in-flight requests', { timeout: 5000 }, async () => {
  await assert.rejects(request('/slow', { signal: AbortSignal.abort() }), axios.isCancel);
  const controller = new AbortController();
  const received = once(server, 'request');
  const pending = request('/slow', { signal: controller.signal });
  const rejected = assert.rejects(pending, axios.isCancel);
  await received;
  controller.abort();
  await rejected;
});

test('authenticated hook signs out on JSON and malformed 401 responses only', async () => {
  let signOuts = 0;
  const send = authenticatedRequest({ accessToken: 'session', signOut: () => signOuts++ });
  assert.equal((await send('/echo')).headers.authorization, 'Bearer session');
  await assert.rejects(send('/error', { params: { status: 401 } }));
  await assert.rejects(send('/invalid', { params: { status: 401 } }));
  assert.equal(signOuts, 2);
  await assert.rejects(send('/error', { params: { status: 403 } }));
  await assert.rejects(send('/disconnect'));
  await assert.rejects(send('/slow', { signal: AbortSignal.abort() }));
  const anonymous = authenticatedRequest({ accessToken: null, signOut: () => signOuts++ });
  await assert.rejects(anonymous('/error', { params: { status: 401 } }));
  assert.equal(signOuts, 2);
});

test('service writes send payloads through Axios and dashboard pagination reaches the server', async () => {
  const users = await vite.ssrLoadModule('/src/services/userService.js');
  const surveys = await vite.ssrLoadModule('/src/services/adminSurveyService.js');
  const { submitSurveyResponse } = await vite.ssrLoadModule('/src/services/surveyService.js');
  const { getAdminDashboard } = await vite.ssrLoadModule('/src/services/adminDashboardService.js');
  const user = { username: 'tester' };
  assert.deepEqual((await users.createUser(request, user)).body, user);
  assert.deepEqual((await users.updateUser(request, 'user id', user)).body, user);
  const survey = { title: 'Survey', version: 2, active: true };
  assert.deepEqual((await surveys.createSurvey(request, survey)).body, { ...survey, active: false });
  assert.deepEqual((await surveys.updateSurvey(request, 'id', survey)).body, survey);
  assert.deepEqual((await surveys.setSurveyActive(request, { ...survey, id: 'id' }, false)).body, { ...survey, active: false });
  assert.deepEqual((await submitSurveyResponse(request, { answers: {} })).body, { answers: {} });
  const dashboard = await getAdminDashboard(request, { page: 2, pageSize: 5 });
  assert.equal(dashboard.submissions.page, 2);
  assert.equal(dashboard.submissions.pageSize, 5);
});
