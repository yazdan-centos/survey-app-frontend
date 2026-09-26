import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

let vite;
let dimensionService;
let criterionService;
const dimensionId = '12345678-1234-1234-1234-123456789abc';
const otherDimensionId = '87654321-1234-1234-1234-123456789abc';

before(async () => {
  vite = await createServer({ server: { middlewareMode: true, watch: null, hmr: false } });
  ({ dimensionService, criterionService } = await vite.ssrLoadModule('/src/services/adminStructureService.js'));
});
after(async () => { await vite?.close(); });

test('dimension create and update send only the backend fields with an integer display order', async () => {
  const calls = [];
  const request = async (path, options) => { calls.push({ path, ...options }); return { id: dimensionId, ...options.body }; };
  const payload = { key: ' strategy ', label: ' راهبرد ', displayOrder: '2', criteria: [], id: 'ignored' };
  const created = await dimensionService.create(request, payload);
  const updated = await dimensionService.update(request, dimensionId, { ...payload, displayOrder: '0' });
  assert.deepEqual(calls, [
    { path: '/api/dimensions', method: 'POST', body: { key: 'strategy', label: 'راهبرد', displayOrder: 2 } },
    { path: `/api/dimensions/${dimensionId}`, method: 'PUT', body: { key: 'strategy', label: 'راهبرد', displayOrder: 0 } },
  ]);
  assert.equal(created.id, dimensionId);
  assert.equal(updated.displayOrder, 0);
});

test('criterion create and update include the selected parent and support moving dimensions', async () => {
  const calls = [];
  const request = async (path, options) => { calls.push({ path, ...options }); return { id: 'criterion-id', ...options.body }; };
  await criterionService.create(request, { name: ' Leadership ', dimensionId, questions: [] });
  const updated = await criterionService.update(request, 'criterion-id', { name: 'Leadership', dimensionId: otherDimensionId });
  assert.deepEqual(calls, [
    { path: '/api/criteria', method: 'POST', body: { name: 'Leadership', dimensionId } },
    { path: '/api/criteria/criterion-id', method: 'PUT', body: { name: 'Leadership', dimensionId: otherDimensionId } },
  ]);
  assert.equal(updated.dimensionId, otherDimensionId);
});

test('invalid required fields, lengths, parent IDs, and display orders never issue a request', () => {
  const request = () => assert.fail('Invalid data must not reach the backend');
  const validDimension = { key: 'strategy', label: 'Strategy', displayOrder: 1 };
  for (const fields of [{ key: ' ' }, { key: 'a'.repeat(81) }, { label: '' }, { label: 'a'.repeat(201) },
    { displayOrder: '' }, { displayOrder: null }, { displayOrder: 1.5 }, { displayOrder: 'invalid' },
    { displayOrder: 2147483648 }, { displayOrder: -2147483649 }]) {
    assert.throws(() => dimensionService.create(request, { ...validDimension, ...fields }));
    assert.throws(() => dimensionService.update(request, dimensionId, { ...validDimension, ...fields }));
  }
  for (const fields of [{ name: ' ' }, { name: 'a'.repeat(201) }, { dimensionId: '' }, { dimensionId: 'invalid' }]) {
    assert.throws(() => criterionService.create(request, { name: 'Leadership', dimensionId, ...fields }));
    assert.throws(() => criterionService.update(request, 'criterion-id', { name: 'Leadership', dimensionId, ...fields }));
  }
});

test('lists preserve cancellation and support criteria filtering', async () => {
  const signal = new AbortController().signal;
  const calls = [];
  const request = async (path, options) => { calls.push({ path, ...options }); return []; };
  await dimensionService.list(request, { signal });
  await criterionService.list(request, { signal });
  await criterionService.list(request, { dimensionId, signal });
  assert.deepEqual(calls, [
    { path: '/api/dimensions', method: 'GET', signal },
    { path: '/api/criteria', method: 'GET', signal },
    { path: `/api/criteria?dimensionId=${dimensionId}`, method: 'GET', signal },
  ]);
  for (const service of [dimensionService, criterionService]) {
    await assert.rejects(service.list(async () => ({ items: [] })), /معتبر نیست/);
  }
});

test('deletion accepts an empty 204 response and preserves conflicts and authentication errors', async () => {
  for (const [service, endpoint] of [[dimensionService, 'dimensions'], [criterionService, 'criteria']]) {
    assert.equal(await service.remove(async (path, options) => {
      assert.equal(path, `/api/${endpoint}/record-id`);
      assert.deepEqual(options, { method: 'DELETE' });
      return null;
    }, 'record-id'), null);
    for (const status of [401, 404, 409]) {
      const error = Object.assign(new Error('Backend rejection'), { status });
      await assert.rejects(service.remove(async () => { throw error; }, 'record-id'), (actual) => actual === error);
    }
  }
});

test('admin pages render labeled forms and sidebar links in the existing router and auth context', async () => {
  const { AuthContext } = await vite.ssrLoadModule('/src/context/AuthContext.jsx');
  for (const [file, title, field] of [
    ['AdminDimensionsPage', 'مدیریت ابعاد', 'displayOrder'],
    ['AdminCriteriaPage', 'مدیریت معیارها', 'dimensionId'],
  ]) {
    const { default: Page } = await vite.ssrLoadModule(`/src/pages/${file}.jsx`);
    const markup = renderToStaticMarkup(createElement(AuthContext.Provider, { value: { accessToken: 'token', signOut() {} } },
      createElement(MemoryRouter, null, createElement(Page))));
    assert.ok(markup.includes(title));
    assert.ok(markup.includes(`name="${field}"`));
    assert.ok(markup.includes('disabled=""'));
  }
  const { default: Sidebar } = await vite.ssrLoadModule('/src/components/layout/AdminSidebar.jsx');
  const navigation = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Sidebar)));
  assert.ok(navigation.includes('href="/admin/dimensions"'));
  assert.ok(navigation.includes('href="/admin/criteria"'));
});
