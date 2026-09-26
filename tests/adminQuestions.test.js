import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';
import * as XLSX from 'xlsx';

let vite;
let service;
const surveyId = '12345678-1234-1234-1234-123456789abc';
const question = { surveyId, code: ' Q1 ', text: ' Question ', role: 'MANAGERS', levels: [{ title: ' Level ', score: '1', levelOrder: '2' }] };
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, watch: null, hmr: false } });
  service = await vite.ssrLoadModule('/src/services/adminQuestionService.js');
});
after(async () => { await vite?.close(); });

test('creation posts the backend DTO with survey ID and structured levels', async () => {
  const result = await service.createQuestion(async (path, options) => {
    assert.equal(path, '/api/questions');
    assert.equal(options.method, 'POST');
    assert.deepEqual(options.body, { surveyId, code: 'Q1', text: 'Question', role: 'MANAGERS', levels: [{ title: 'Level', score: 1, levelOrder: 2 }] });
    return { id: 'created' };
  }, { ...question, prompt: 'unsupported', type: 'likert', options: [] });
  assert.deepEqual(result, { id: 'created' });
});

test('rejects missing required fields, unknown roles, invalid levels, and duplicate scores', () => {
  for (const change of [{ surveyId: '' }, { code: ' ' }, { text: '' }, { role: 'manager' },
    { levels: [{ title: '', score: 1, levelOrder: 1 }] },
    { levels: [{ title: 'A', score: '', levelOrder: 1 }] },
    { levels: [{ title: 'A', score: 1.5, levelOrder: 1 }] },
    { levels: [{ title: 'A', score: 2147483648, levelOrder: 1 }] },
    { levels: [question.levels[0], question.levels[0]] }]) {
    assert.throws(() => service.questionPayload({ ...question, ...change }));
  }
});

test('Excel round trip groups levels by code and role and attaches selected survey', () => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    service.QUESTION_IMPORT_HEADERS,
    ['Q1', 'سؤال', 'BOARD', 'کم', 1, 1],
    ['Q1', 'سؤال', 'BOARD', 'زیاد', 2, 2],
    ['Q1', 'سؤال دیگر', 'CUSTOMERS', '', '', ''],
  ]), 'Questions');
  const read = XLSX.read(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  const rows = XLSX.utils.sheet_to_json(read.Sheets.Questions, { defval: '' });
  const result = service.parseQuestionRows(rows, surveyId);
  assert.equal(result.length, 2);
  assert.equal(result[0].surveyId, surveyId);
  assert.deepEqual(result[0].levels, [{ title: 'کم', score: 1, levelOrder: 1 }, { title: 'زیاد', score: 2, levelOrder: 2 }]);
  assert.deepEqual(result[1].levels, []);
  assert.throws(() => service.parseQuestionRows([...rows, { ...rows[0], text: 'conflicting' }], surveyId));
  assert.throws(() => service.parseQuestionRows([{ code: 'old', prompt: 'old format' }], surveyId));
  assert.throws(() => service.parseQuestionRows([], surveyId));
});

test('creation propagates server failures', async () => {
  await assert.rejects(service.createQuestion(async () => { throw new Error('Server rejected request'); }, question), /Server rejected/);
});
