import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let vite;
let service;

before(async () => {
  vite = await createServer({ server: { middlewareMode: true, watch: null, hmr: false } });
  service = await vite.ssrLoadModule('/src/services/demographicQuestionService.js');
});

after(async () => { await vite?.close(); });

test('demographic question requests match the backend CRUD paths and fields', async () => {
  const calls = [];
  const request = async (path, options) => {
    calls.push({ path, options });
    return options?.method === 'DELETE' ? null : options?.method ? { id: 'question-id' } : [];
  };
  const input = { groupKey: ' managers ', question: ' Role? ', type: '', displayOrder: '2', options: 'First\n\n Second ' };
  await service.demographicQuestionService.list(request);
  await service.demographicQuestionService.create(request, input);
  await service.demographicQuestionService.update(request, 'question-id', input);
  await service.demographicQuestionService.remove(request, 'question-id');
  assert.deepEqual(calls.map(({ path, options }) => [path, options?.method || 'GET']), [
    ['/api/demographic-questions', 'GET'],
    ['/api/demographic-questions', 'POST'],
    ['/api/demographic-questions/question-id', 'PUT'],
    ['/api/demographic-questions/question-id', 'DELETE'],
  ]);
  assert.deepEqual(calls[1].options.body, {
    groupKey: 'managers', question: 'Role?', type: null, displayOrder: 2, options: ['First', 'Second'],
  });
  assert.deepEqual(calls[2].options.body, calls[1].options.body);
});

test('invalid positions and missing options are rejected before saving', () => {
  const input = { groupKey: 'managers', question: 'Role?', displayOrder: '0', options: 'First' };
  assert.throws(() => service.demographicQuestionPayload({ ...input, displayOrder: '-1' }));
  assert.throws(() => service.demographicQuestionPayload({ ...input, displayOrder: '' }));
  assert.throws(() => service.demographicQuestionPayload({ ...input, options: ' \n ' }));
});
