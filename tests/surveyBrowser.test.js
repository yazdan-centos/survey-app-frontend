import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const browserPath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const pause = () => new Promise((resolve) => setTimeout(resolve, 100));

test('backend-only questionnaire supports navigation, persistence, retry and empty states', {
  skip: !existsSync(browserPath), timeout: 60000,
}, async () => {
  let mode = 'ok';
  const requests = [];
  const survey = { id: '11111111-1111-1111-1111-111111111111', title: 'QA Survey', active: true };
  const questions = [1, 2].map((number) => ({
    id: `00000000-0000-0000-0000-00000000000${number}`, surveyId: survey.id, code: `Q${number}`,
    text: `LIVE_BACKEND_QUESTION_${number}`, role: 'BOARD', displayOrder: 1,
    criterionId: `criterion-${number}`, criterionName: `Criterion ${number}`,
    dimension: { id: `dimension-${number}`, key: `backendOnlyDimension${number}`, label: `LIVE_DIMENSION_${number}`, displayOrder: number },
    levels: [{ levelNumber: 2, description: 'LIVE_LEVEL_TWO' }, { levelNumber: 4, description: 'LIVE_LEVEL_FOUR' }],
  }));
  const server = await createServer({ configFile: false,
    plugins: [react(), { name: 'test-questionnaire-api', configureServer(vite) {
      vite.middlewares.use((request, response, next) => {
        if (!request.url.startsWith('/api/')) return next();
        requests.push({ url: request.url, authorization: request.headers.authorization });
        response.setHeader('content-type', 'application/json');
        if (mode === 'error') { response.statusCode = 503; return response.end(JSON.stringify({ message: 'QA_BACKEND_UNAVAILABLE' })); }
        if (request.url === '/api/v1/surveys/active') {
          if (mode === 'no-active') { response.statusCode = 404; return response.end('{}'); }
          return response.end(JSON.stringify(survey));
        }
        if (request.url === `/api/questions/survey/${survey.id}`) return response.end(JSON.stringify(mode === 'empty' ? [] : questions));
        response.statusCode = 404;
        response.end('{}');
      });
    } }], define: { 'import.meta.env.VITE_API_BASE_URL': '""' },
    server: { host: '127.0.0.1', port: 0, hmr: false, ws: false },
  });
  const profile = await mkdtemp(path.join(tmpdir(), 'survey-browser-test-'));
  let browser;
  let socket;
  try {
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let debugPort;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { debugPort = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
      catch { await pause(); }
    }
    assert.ok(debugPort, 'Browser must start');
    const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
    socket = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    let sequence = 0;
    const pending = new Map();
    const browserErrors = [];
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const call = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) call?.reject(message.error); else call?.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error' && message.params.entry.source === 'javascript') browserErrors.push(message.params.entry.text);
    });
    const send = async (method, params = {}) => {
      // Clear the previous page so waitFor cannot match text from before navigation.
      if (method === 'Page.reload' || method === 'Page.navigate') {
        await send('Runtime.evaluate', { expression: 'document.body?.replaceChildren()' });
      }
      return new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
      });
    };
    const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;
    const waitFor = async (text) => {
      for (let attempt = 0; attempt < 100; attempt++) {
        if ((await evaluate('document.body?.innerText') || '').includes(text)) return;
        await pause();
      }
      assert.fail(`Missing ${text}; body: ${await evaluate('document.body.innerText')}; errors: ${JSON.stringify(browserErrors)}; requests: ${JSON.stringify(requests)}`);
    };
    const clickText = async (text) => evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes(${JSON.stringify(text)}))?.click()`);
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Network.enable');
    await send('Network.setBlockedURLs', { urls: ['https://cdn.jsdelivr.net/*'] });
    await send('Page.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `
      sessionStorage.setItem('wcs:auth:v1',JSON.stringify({accessToken:'qa-token',user:{id:'qa-user'}}));
      if(!localStorage.getItem('wcs:survey-state:v2'))localStorage.setItem('wcs:survey-state:v2',JSON.stringify({surveyId:'${survey.id}',respondentKey:'qa-user',roleId:'board',answers:{},demographics:{},managerGuideSeen:true,submittedAt:null}));
    ` });
    await send('Page.navigate', { url: `${origin}/survey/backendOnlyDimension1` });
    await waitFor('LIVE_BACKEND_QUESTION_1');
    await clickText('LIVE_LEVEL_TWO');
    await clickText('بُعد بعدی');
    await waitFor('LIVE_BACKEND_QUESTION_2');
    assert.equal(await evaluate(`JSON.parse(localStorage.getItem('wcs:survey-state:v2')).answers['${questions[0].id}']`), 2);
    assert.ok(requests.every((request) => request.authorization === 'Bearer qa-token'));
    assert.ok(requests.some((request) => request.url === `/api/questions/survey/${survey.id}`));
    await send('Page.reload');
    await waitFor('LIVE_BACKEND_QUESTION_2');
    survey.id = '44444444-4444-4444-4444-444444444444';
    questions.forEach((question) => { question.surveyId = survey.id; });
    await send('Page.reload');
    await waitFor('LIVE_BACKEND_QUESTION_2');
    await clickText('LIVE_LEVEL_FOUR');
    const updatedState = await evaluate("JSON.parse(localStorage.getItem('wcs:survey-state:v2'))");
    assert.equal(updatedState.surveyId, survey.id);
    assert.deepEqual(updatedState.answers, { [questions[1].id]: 4 });
    mode = 'error';
    await send('Page.reload');
    await waitFor('QA_BACKEND_UNAVAILABLE');
    assert.equal((await evaluate('document.body.innerText')).includes('LIVE_BACKEND_QUESTION'), false);
    mode = 'ok';
    await clickText('دریافت دوباره سؤال‌ها');
    await waitFor('LIVE_BACKEND_QUESTION_2');
    mode = 'empty';
    await send('Page.reload');
    await waitFor('هنوز سؤالی برای این پیمایش ثبت نشده است.');
    mode = 'no-active';
    await send('Page.reload');
    await waitFor('در حال حاضر پیمایش فعالی وجود ندارد.');
    mode = 'ok';
    await evaluate(`localStorage.setItem('wcs:survey-state:v2',JSON.stringify({surveyId:'${survey.id}',respondentKey:'qa-user',roleId:null,answers:{},demographics:{},managerGuideSeen:false,submittedAt:null}))`);
    await send('Page.navigate', { url: `${origin}/` });
    await waitFor('اطلاعات دموگرافی');
    assert.equal(await evaluate("JSON.parse(localStorage.getItem('wcs:survey-state:v2')).roleId"), 'board');
    // A non-admin without a role must override the previously saved board profile.
    const managerQuestion = { ...questions[0], id: 'manager-question', role: 'MANAGERS', text: 'MANAGER_ONLY_QUESTION' };
    questions.push(managerQuestion);
    const userScript = await send('Page.addScriptToEvaluateOnNewDocument', { source: `
      sessionStorage.setItem('wcs:auth:v1',JSON.stringify({accessToken:'qa-token',user:{id:'qa-user',isAdmin:false}}));
    ` });
    await send('Page.reload');
    await waitFor('سطح مدیریتی شما کدام است؟');
    await send('Page.navigate', { url: `${origin}/survey/backendOnlyDimension1` });
    await waitFor('شروع پیمایش');
    await clickText('شروع پیمایش');
    await waitFor('MANAGER_ONLY_QUESTION');
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('button')).some(button => button.textContent.includes('اطلاعات کافی برای ارزیابی این موضوع ندارم'))`), false);
    assert.equal((await evaluate('document.body.innerText')).includes('LIVE_BACKEND_QUESTION_1'), false);
    await clickText('LIVE_LEVEL_TWO');
    assert.equal(await evaluate("JSON.parse(localStorage.getItem('wcs:survey-state:v2')).roleId"), 'managers');
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: userScript.identifier });
    questions.push({ ...questions[0], id: 'supplier-question', role: 'SUPPLIERS', text: 'SUPPLIER_ONLY_QUESTION' });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `
      sessionStorage.setItem('wcs:auth:v1',JSON.stringify({accessToken:'qa-token',user:{id:'qa-user',role:'SUPPLIERS'}}));
    ` });
    await send('Page.reload');
    await waitFor('شروع پیمایش');
    await clickText('شروع پیمایش');
    await waitFor('SUPPLIER_ONLY_QUESTION');
    await clickText('اطلاعات کافی برای ارزیابی این موضوع ندارم');
    assert.equal(await evaluate("JSON.parse(localStorage.getItem('wcs:survey-state:v2')).answers['supplier-question']"), 'skip');
    assert.deepEqual(browserErrors, []);
    await send('Browser.close');
  } finally {
    socket?.close();
    if (browser && browser.exitCode === null) {
      await Promise.race([new Promise((resolve) => browser.once('exit', resolve)), new Promise((resolve) => setTimeout(resolve, 2000))]);
      if (browser.exitCode === null) browser.kill();
    }
    await server.close();
    const resolvedProfile = path.resolve(profile);
    if (resolvedProfile.startsWith(path.resolve(tmpdir()) + path.sep) && path.basename(resolvedProfile).startsWith('survey-browser-test-')) {
      await rm(resolvedProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  }
});
