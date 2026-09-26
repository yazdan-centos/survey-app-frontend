import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let vite;
let getSurveyReports;

before(async () => {
  vite = await createServer({ server: { middlewareMode: true, watch: null, hmr: false } });
  ({ getSurveyReports } = await vite.ssrLoadModule('/src/services/reportService.js'));
});

after(async () => {
  await vite?.close();
});

test('loads authenticated dashboard data with cancellation and keeps surveys separate', async () => {
  const controller = new AbortController();
  const reports = await getSurveyReports(async (path, options) => {
    assert.equal(path, '/api/surveys/dashboard');
    assert.equal(options.signal, controller.signal);
    return { summary: {}, surveys: [
      { id: 1, title: 'First', responseCount: '3', answeredCount: '8', skippedCount: 2,
        audiences: [{ role: 'MANAGERS', responseCount: 3, answeredCount: 8, skippedCount: 2 }] },
      { id: 2, title: 'Second', responseCount: 0 },
    ] };
  }, { signal: controller.signal });
  assert.equal(reports[0].id, '1');
  assert.equal(reports[0].responseCount, 3);
  assert.equal(reports[0].answeredCount, 8);
  assert.equal(reports[0].audiences[0].responseCount, 3);
  assert.equal(reports[1].responseCount, 0);
  assert.deepEqual(reports[1].audiences, []);
});

test('supports an empty survey collection', async () => {
  assert.deepEqual(await getSurveyReports(async () => ({ summary: {}, surveys: [] })), []);
});

test('rejects malformed reports instead of drawing misleading charts', async () => {
  for (const data of [null, {}, { summary: {}, surveys: [{ title: 'Missing ID' }] },
    { summary: {}, surveys: [{ id: 'one', responseCount: -1 }] },
    { summary: {}, surveys: [{ id: 'one', answeredCount: 'invalid' }] }]) {
    await assert.rejects(getSurveyReports(async () => data));
  }
});

test('propagates request failures for the page retry state', async () => {
  const failure = new Error('Server unavailable');
  await assert.rejects(getSurveyReports(async () => { throw failure; }), (error) => error === failure);
});
