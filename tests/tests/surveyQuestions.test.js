import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

let vite;
let service;
let assignmentService;
const survey = { id: 'survey-id', title: 'Backend survey', active: true };
const activeItem = { survey, assignmentId: 'assignment-id', assignmentStatus: 'ASSIGNED', activeFrom: null, activeUntil: null };
const otherSurvey = { id: 'other-survey-id', title: 'Other survey', active: true };
const otherItem = { survey: otherSurvey, assignmentId: 'other-assignment-id', assignmentStatus: 'ACTIVE', activeFrom: null, activeUntil: null };
const question = {
    id: 'question-id', surveyId: survey.id, code: 'Q1', text: 'Backend-only question text?', role: 'BOARD', displayOrder: 2,
    criterionId: 'criterion-id', criterionName: 'Criterion from backend',
    dimension: { id: 'dimension-id', key: 'newDimension', label: 'Backend dimension', displayOrder: 5 },
    levels: [{ levelNumber: 4, description: 'Fourth level from backend' }, { levelNumber: 2, description: 'Second level from backend' }],
};

before(async () => {
    vite = await createServer({ server: { middlewareMode: true, watch: null, hmr: false } });
    service = await vite.ssrLoadModule('/src/services/surveyService.js');
    assignmentService = await vite.ssrLoadModule('/src/services/surveyAssignmentService.js');
});
after(async () => { await vite?.close(); });

test('loads the assigned active survey then only its questions, propagating cancellation', async () => {
    const signal = new AbortController().signal;
    const calls = [];
    const result = await service.getActiveQuestionnaire(async (path, options) => {
        calls.push(path);
        assert.equal(options.signal, signal);
        if (path === '/api/users/me/active-surveys') return [activeItem];
        assert.equal(path, '/api/questions/survey/survey-id');
        return [question];
    }, { signal });
    assert.deepEqual(calls, ['/api/users/me/active-surveys', '/api/questions/survey/survey-id']);
    assert.deepEqual(result.survey, survey);
    assert.equal(result.assignmentId, 'assignment-id');
    assert.deepEqual(result.activeSurveys, [activeItem]);
    assert.equal(result.questions[0].text, question.text);
    assert.equal(result.questions[0].roleId, 'board');
    assert.deepEqual(result.questions[0].levels.map((level) => level.levelNumber), [2, 4]);
});

test('several assigned surveys load only the selected assignment and wait when none is selected', async () => {
    const calls = [];
    const request = async (path) => {
        calls.push(path);
        if (path === '/api/users/me/active-surveys') return [activeItem, otherItem];
        return [{ ...question, surveyId: otherSurvey.id }];
    };
    const chosen = await service.getActiveQuestionnaire(request, { assignmentId: 'other-assignment-id' });
    assert.equal(chosen.survey.id, otherSurvey.id);
    assert.equal(chosen.assignmentId, 'other-assignment-id');
    assert.deepEqual(calls, ['/api/users/me/active-surveys', '/api/questions/survey/other-survey-id']);

    for (const assignmentId of [undefined, null, 'stale-assignment-id']) {
        calls.length = 0;
        const pending = await service.getActiveQuestionnaire(request, { assignmentId });
        assert.equal(pending.survey, null);
        assert.equal(pending.assignmentId, null);
        assert.equal(pending.activeSurveys.length, 2);
        assert.deepEqual(pending.questions, []);
        assert.deepEqual(calls, ['/api/users/me/active-surveys']);
    }
});

test('a single assigned survey is selected automatically even with a stale stored assignment', async () => {
    const result = await service.getActiveQuestionnaire(async (path) => path === '/api/users/me/active-surveys' ? [activeItem] : [question],
        { assignmentId: 'stale-assignment-id' });
    assert.equal(result.assignmentId, 'assignment-id');
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

test('no assigned surveys and no questions stay empty instead of falling back to local data', async () => {
    const noActive = await service.getActiveQuestionnaire(async () => []);
    assert.deepEqual(noActive, { survey: null, assignmentId: null, activeSurveys: [], questions: [] });
    const empty = await service.getActiveQuestionnaire(async (path) => path === '/api/users/me/active-surveys' ? [activeItem] : []);
    assert.deepEqual(empty.questions, []);
});

test('malformed active survey lists are rejected', async () => {
    for (const body of [{}, null, [{ survey }], [{ assignmentId: 'assignment-id' }], [{ assignmentId: 'assignment-id', survey: {} }]]) {
        await assert.rejects(service.getActiveQuestionnaire(async () => body));
    }
});

test('network, authorization, cancellation and question endpoint failures are preserved', async () => {
    for (const status of [0, 401, 403, 500]) {
        const error = Object.assign(new Error('Failed'), { status });
        await assert.rejects(service.getActiveQuestionnaire(async () => { throw error; }), (actual) => actual === error);
    }
    const missingQuestions = Object.assign(new Error('Missing endpoint'), { status: 404 });
    await assert.rejects(service.getActiveQuestionnaire(async (path) => {
        if (path === '/api/users/me/active-surveys') return [activeItem];
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

test('participated surveys are read from the user endpoint and support an empty list', async () => {
    const signal = new AbortController().signal;
    const rows = [{ survey, responseId: 'response-id', submittedAt: '2026-01-01T00:00:00Z' }];
    assert.deepEqual(await service.getParticipatedSurveys(async (path, options) => {
        assert.equal(path, '/api/users/me/participated-surveys');
        assert.equal(options.signal, signal);
        return rows;
    }, { signal }), rows);
    assert.deepEqual(await service.getParticipatedSurveys(async () => []), []);
    await assert.rejects(service.getParticipatedSurveys(async () => ({})));
});

test('result access check only validates access and preserves denials', async () => {
    const paths = [];
    assert.equal(await service.checkSurveyResultsAccess(async (path) => { paths.push(path); return null; }, 'survey/id'), true);
    assert.deepEqual(paths, ['/api/users/me/surveys/survey%2Fid/results']);
    for (const status of [403, 404]) {
        const error = Object.assign(new Error('Denied'), { status });
        await assert.rejects(service.checkSurveyResultsAccess(async () => { throw error; }, 'survey-id'), (actual) => actual === error);
    }
});

test('assignments post the DTO fields, omit empty windows, and revoke by assignment id', async () => {
    const calls = [];
    const created = [{ id: 'assignment-id', status: 'ASSIGNED' }];
    const result = await assignmentService.assignSurveys(async (path, options) => {
        calls.push([path, options]);
        return created;
    }, { userIds: ['user-id'], surveyIds: ['survey-id'], activeFrom: undefined, activeUntil: '2026-02-01T00:00:00.000Z' });
    assert.deepEqual(result, created);
    assert.equal(calls[0][0], '/api/survey-assignments');
    assert.equal(calls[0][1].method, 'POST');
    assert.deepEqual(calls[0][1].body, { userIds: ['user-id'], surveyIds: ['survey-id'], activeUntil: '2026-02-01T00:00:00.000Z' });
    await assert.rejects(assignmentService.assignSurveys(async () => ({}), { userIds: [], surveyIds: [] }));

    await assignmentService.revokeAssignment(async (path, options) => {
        assert.equal(path, '/api/survey-assignments/assignment-id');
        assert.equal(options.method, 'DELETE');
        return null;
    }, 'assignment-id');
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