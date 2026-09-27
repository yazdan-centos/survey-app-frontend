import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

let vite;
let service;
const survey = { id: 'survey-id', title: 'Backend survey', active: true };
const question = {
  id: 'question-id', surveyId: survey.id, code: 'Q1', text: 'Backend-only question text?', role: 'BOARD', displayOrder: 2,
  criterionId: 'criterion-id', criterionName: 'Criterion from backend',
  dimension: { id: 'dimension-id', key: 'newDimension', label: 'Backend dimension', displayOrder: 5 },
  levels: [{ levelNumber: 4, description: 'Fourth level from backend' }, { levelNumber: 2, description: 'Second level from backend' }],
};

before(async () => {
  vite = await createServer({ server: { middlewareMode: true, watch: null, hmr: false } });
  service = await vite.ssrLoadModule('/src/services/surveyService.js');
});
after(async () => { await vite?.close(); });

test('loads the active survey then only its questions, propagating cancellation', async () => {
  const signal = new AbortController().signal;
  const calls = [];
  const result = await service.getActiveQuestionnaire(async (path, options) => {
    calls.push(path);
    assert.equal(options.signal, signal);
    if (path === '/api/v1/surveys/active') return survey;
    assert.equal(path, '/api/questions/survey/survey-id');
    return [question];
  }, { signal });
  assert.deepEqual(calls, ['/api/v1/surveys/active', '/api/questions/survey/survey-id']);
  assert.deepEqual(result.survey, survey);
  assert.equal(result.questions[0].text, question.text);
  assert.equal(result.questions[0].roleId, 'board');
  assert.deepEqual(result.questions[0].levels.map((level) => level.levelNumber), [2, 4]);
});

test('groups only the selected audience and honors backend dimension and question ordering', () => {
  const rows = [question,
    { ...question, id: 'earlier-question', code: 'Q2', displayOrder: 1 },
    { ...question, id: 'other-dimension', dimension: { id: 'other', key: 'notBundled', label: 'New label', displayOrder: 1 } },
    { ...question, id: 'manager-only', role: 'MANAGERS' },
  ];
  const normalized = service.normalizeSurveyQuestions(rows, survey.id);
  const groups = service.groupSurveyQuestions(normalized, 'board');
  assert.deepEqual(groups.map((dimension) => dimension.key), ['notBundled', 'newDimension']);
  assert.equal(groups[0].label, 'New label');
  assert.deepEqual(groups[1].questions.map((item) => item.id), ['earlier-question', 'question-id']);
  assert.deepEqual(service.groupSurveyQuestions(normalized, 'suppliers'), []);
  assert.equal(service.groupSurveyQuestions(normalized, 'managers')[0].questions.length, 1);
});

test('no active survey and no questions stay empty instead of falling back to local data', async () => {
  const noActive = await service.getActiveQuestionnaire(async () => { throw Object.assign(new Error('No active survey'), { status: 404 }); });
  assert.deepEqual(noActive, { survey: null, questions: [] });
  const empty = await service.getActiveQuestionnaire(async (path) => path === '/api/v1/surveys/active' ? survey : []);
  assert.deepEqual(empty.questions, []);
});

test('network, authorization, cancellation and question endpoint failures are preserved', async () => {
  for (const status of [0, 401, 403, 500]) {
    const error = Object.assign(new Error('Failed'), { status });
    await assert.rejects(service.getActiveQuestionnaire(async () => { throw error; }), (actual) => actual === error);
  }
  const missingQuestions = Object.assign(new Error('Missing endpoint'), { status: 404 });
  await assert.rejects(service.getActiveQuestionnaire(async (path) => {
    if (path === '/api/v1/surveys/active') return survey;
    throw missingQuestions;
  }), (actual) => actual === missingQuestions);
  const aborted = new DOMException('Cancelled', 'AbortError');
  await assert.rejects(service.getActiveQuestionnaire(async () => { throw aborted; }), (actual) => actual === aborted);
});

test('malformed or mixed-survey questions are rejected', () => {
  for (const change of [{ surveyId: 'different' }, { text: '' }, { role: 'unknown' }, { dimension: null },
    { levels: [] }, { levels: [{ levelNumber: 0, description: 'invalid' }] },
    { levels: [{ levelNumber: 1, description: '' }] }, { levels: [question.levels[0], question.levels[0]] }]) {
    assert.throws(() => service.normalizeSurveyQuestions([{ ...question, ...change }], survey.id));
  }
  assert.throws(() => service.normalizeSurveyQuestions([question, question], survey.id));
  assert.throws(() => service.normalizeSurveyQuestions({}, survey.id));
});

test('answers use actual level numbers and reject stale or forbidden skip values', () => {
  assert.equal(service.isValidQuestionAnswer(question, 2, false), true);
  assert.equal(service.isValidQuestionAnswer(question, 4, false), true);
  assert.equal(service.isValidQuestionAnswer(question, 1, false), false);
  assert.equal(service.isValidQuestionAnswer(question, '2', false), false);
  assert.equal(service.isValidQuestionAnswer(question, 'skip', false), false);
  assert.equal(service.isValidQuestionAnswer(question, 'skip', true), true);
});

test('question card renders backend text and descriptions without a hardcoded question suffix', async () => {
  const { default: QuestionCard } = await vite.ssrLoadModule('/src/components/survey/QuestionCard.jsx');
  const markup = renderToStaticMarkup(createElement(QuestionCard, { question, value: 4, accentColor: '#000', nextLabel: 'Next' }));
  assert.ok(markup.includes(question.text));
  assert.ok(markup.includes(question.levels[0].description));
  assert.ok(markup.includes(question.levels[1].description));
  assert.ok(markup.includes('aria-pressed="true"'));
  assert.equal(markup.includes('در سازمان شما در چه سطحی است؟'), false);
});

test('regular users resolve to managers and only suppliers can skip questions', async () => {
  const { ROLES, getRespondentRoleId, getRoleById } = await vite.ssrLoadModule('/src/data/roles.js');
  const { default: QuestionCard } = await vite.ssrLoadModule('/src/components/survey/QuestionCard.jsx');
  assert.equal(getRespondentRoleId({ role: 'USER', isAdmin: false }), 'managers');
  assert.equal(getRoleById(getRespondentRoleId({ role: 'USER', isAdmin: false })).demoKey, 'managers');
  assert.equal(getRespondentRoleId({ role: 'USER', isAdmin: true }), null);
  assert.equal(getRespondentRoleId({ isAdmin: false }), 'managers');
  for (const role of ROLES) {
    assert.equal(getRespondentRoleId({ role: role.id.toUpperCase(), isAdmin: false }), 'managers');
    assert.equal(getRespondentRoleId({ role: role.id.toUpperCase() }), role.id);
    const markup = renderToStaticMarkup(createElement(QuestionCard, { question, allowSkip: role.allowSkip }));
    assert.equal(markup.includes('اطلاعات کافی برای ارزیابی این موضوع ندارم'), role.id === 'suppliers');
    assert.equal(service.isValidQuestionAnswer(question, 'skip', role.allowSkip), role.id === 'suppliers');
  }
});
