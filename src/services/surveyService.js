import { API_PATHS } from '../config/api';
import { Layers } from 'lucide-react';
import { ROLES } from '../data/roles';

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

export async function getActiveQuestionnaire(request, { signal } = {}) {
  let survey;
  try {
    survey = await request(API_PATHS.activeSurvey, { signal, preserveSessionOnUnauthorized: true });
  } catch (error) {
    if (error.status === 404) return { survey: null, questions: [] };
    throw error;
  }
  if (!survey?.id || survey.active !== true) throw new Error('اطلاعات پیمایش فعال معتبر نیست.');
  const rows = await request(API_PATHS.questionsBySurvey(encodeURIComponent(survey.id)), { signal });
  return { survey, questions: normalizeSurveyQuestions(rows, survey.id) };
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
