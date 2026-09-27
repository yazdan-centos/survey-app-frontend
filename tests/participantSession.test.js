import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let useHttp;
let AuthContext;

before(async () => {
  vite = await createServer({ server: { middlewareMode: true, watch: null, hmr: false } });
  ({ useHttp } = await vite.ssrLoadModule('/src/hooks/useHttp.js'));
  ({ AuthContext } = await vite.ssrLoadModule('/src/context/AuthContext.jsx'));
});

after(async () => { await vite?.close(); });

test('an active-survey 401 reports the error without logging out the participant', async () => {
  const originalFetch = globalThis.fetch;
  let signOuts = 0;
  let request;
  let authorization;
  function Capture() {
    // oxlint-disable-next-line react/globals -- Capture the hook from the server-rendered test harness.
    request = useHttp();
    return null;
  }
  renderToStaticMarkup(createElement(AuthContext.Provider, {
    value: { accessToken: 'participant-token', signOut: () => { signOuts++; } },
  }, createElement(Capture)));
  globalThis.fetch = async (_url, options) => {
    authorization = options.headers.Authorization;
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    await assert.rejects(request('/api/v1/surveys/active', { preserveSessionOnUnauthorized: true }), /Unauthorized/);
    assert.equal(authorization, 'Bearer participant-token');
    assert.equal(signOuts, 0);
    await assert.rejects(request('/api/questions/survey/id'), /Unauthorized/);
    assert.equal(signOuts, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
