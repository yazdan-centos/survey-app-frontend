import { API_PATHS } from '../config/api';
import { Layers } from 'lucide-react';
import { ROLES } from '../data/roles';

/**
 * @typedef {Object} ActiveSurveyItem  GET /api/users/me/active-surveys
 * @property {Object} survey            Full survey DTO (id, title, version, active, ...)
 * @property {string} assignmentId
 * @property {string} assignmentStatus  ASSIGNED | ACTIVE
 * @property {string|null} activeFrom
 * @property {string|null} activeUntil
 *
 * @typedef {Object} ParticipatedSurveyItem  GET /api/users/me/participated-surveys
 * @property {Object} survey
 * @property {string} responseId
 * @property {string} submittedAt
 *
 * @typedef {Object} SaveSurveyResponseRequest  POST/PUT /api/survey-responses
 * @property {string} role
 * @property {string} [surveyAssignmentId]  assignmentId of the assigned survey (never the surveyId)
 * @property {Array} answers
 * @property {Array} demographics
 *
 * @typedef {Object} SurveyResponseDetails  GET /api/survey-responses/{responseId}
 * @property {string} id
 * @property {string} role
 * @property {string} respondentUsername
 * @property {string|null} userId              nullable
 * @property {string|null} surveyId            nullable
 * @property {string|null} surveyAssignmentId  nullable
 * @property {string} submittedAt
 * @property {Array} answers
 * @property {Array} demographics
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export function normalizeSurveyQuestions(rows, surveyId) {
  if (!Array.isArray(rows)) throw new Error('ساختار سؤال‌های پیمایش معتبر نیست.');
  const ids = new Set();
  return rows.map((question) => {
    const dimension = question.dimension;
    const roleId = String(question.role ?? '').toLowerCase();
    if (!question.id || ids.has(question.id) || question.surveyId !== surveyId ||
        !ROLES.some((role) => role.id === roleId) || !question.code || !question.text?.trim() ||
        !dimension?.id || !dimension.key || !dimension.label || !Number.isInteger(dimension.displayOrder) ||
        !Number.isInteger(question.displayOrder) || !Array.isArray(question.levels) || !question.levels.length) {
      throw new Error('اطلاعات سؤال، بُعد یا سطوح پاسخ ناقص است. لطفاً با مدیر سامانه تماس بگیرید.');
    }
    ids.add(question.id);
    const levelNumbers = new Set();
    const levels = question.levels.map((level) => {
      if (!Number.isInteger(level.levelNumber) || level.levelNumber <= 0 ||
          levelNumbers.has(level.levelNumber) || !level.description?.trim()) {
        throw new Error('سطوح پاسخ سؤال معتبر نیست. لطفاً با مدیر سامانه تماس بگیرید.');
      }
      levelNumbers.add(level.levelNumber);
      return { levelNumber: level.levelNumber, description: level.description };
    }).sort((first, second) => first.levelNumber - second.levelNumber);
    return { ...question, roleId, levels };
  });
}

export function groupSurveyQuestions(questions, roleId) {
  const groups = new Map();
  for (const question of questions.filter((item) => item.roleId === roleId)) {
    const dimension = question.dimension;
    if (!groups.has(dimension.id)) {
      groups.set(dimension.id, { ...dimension, shortLabel: dimension.label, icon: Layers, color: '#0E7C7B', questions: [] });
    }
    groups.get(dimension.id).questions.push(question);
  }
  return [...groups.values()]
      .sort((first, second) => first.displayOrder - second.displayOrder || first.key.localeCompare(second.key))
      .map((dimension) => ({ ...dimension, questions: dimension.questions.sort((first, second) =>
            first.displayOrder - second.displayOrder || first.code.localeCompare(second.code, undefined, { numeric: true })) }));
}

function normalizeActiveSurveys(rows) {
  if (!Array.isArray(rows)) throw new Error('اطلاعات پیمایش‌های فعال معتبر نیست.');
  for (const item of rows) {
    if (!item?.assignmentId || !item.survey?.id) throw new Error('اطلاعات پیمایش‌های فعال معتبر نیست.');
  }
  return rows;
}

// Loads the surveys assigned to the signed-in user. A single active survey is
// selected automatically; with several, `assignmentId` picks which one to load.
export async function getActiveQuestionnaire(request, { signal, assignmentId } = {}) {
  const activeSurveys = normalizeActiveSurveys(
      await request(API_PATHS.activeSurveys, { signal, preserveSessionOnUnauthorized: true })
  );
  const selected = activeSurveys.length === 1
      ? activeSurveys[0]
      : activeSurveys.find((item) => item.assignmentId === assignmentId);
  if (!selected) return { survey: null, assignmentId: null, activeSurveys, questions: [] };
  const rows = await request(API_PATHS.questionsBySurvey(encodeURIComponent(selected.survey.id)), { signal });
  return {
    survey: selected.survey,
    assignmentId: selected.assignmentId,
    activeSurveys,
    questions: normalizeSurveyQuestions(rows, selected.survey.id),
  };
}

export async function getParticipatedSurveys(request, { signal } = {}) {
  const rows = await request(API_PATHS.participatedSurveys, { signal });
  if (!Array.isArray(rows)) throw new Error('ساختار سوابق پیمایش‌های شرکت‌کرده معتبر نیست.');
  return rows;
}

// Access validation only: resolves when allowed and rejects (403/404) otherwise.
// The endpoint returns no results payload.
export async function checkSurveyResultsAccess(request, surveyId, { signal } = {}) {
  await request(API_PATHS.surveyResultsAccess(encodeURIComponent(surveyId)), { signal });
  return true;
}

export function isValidQuestionAnswer(question, value, allowSkip) {
  return value === 'skip' ? Boolean(allowSkip) : question.levels.some((level) => level.levelNumber === value);
}

export function submitSurveyResponse(request, payload) {
  return request(API_PATHS.surveyResponses, {
    method: 'POST',
    body: payload,
  });
}