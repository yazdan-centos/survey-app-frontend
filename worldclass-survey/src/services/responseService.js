import { API_PATHS } from '../config/api';

export const isResponseId = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function getResponseOverview(request, { signal } = {}) {
  // The current backend exposes aggregate counts, not a response collection.
  const data = await request(API_PATHS.dashboard, { signal });
  if (!data?.summary || !Array.isArray(data.surveys)) {
    throw new Error('ساختار آمار پاسخ‌نامه‌ها معتبر نیست.');
  }
  return data;
}

export async function getResponse(request, id, { signal } = {}) {
  const data = await request(API_PATHS.surveyResponse(encodeURIComponent(id)), { signal });
  if (!data?.id || !Array.isArray(data.answers) || !Array.isArray(data.demographics)) {
    throw new Error('ساختار اطلاعات پاسخ‌نامه معتبر نیست.');
  }
  return data;
}

export async function getResponseQuestions(request, surveyIds, { signal } = {}) {
  const results = await Promise.allSettled(surveyIds.map((id) =>
    request(API_PATHS.questionsBySurvey(encodeURIComponent(id)), { signal })
  ));
  const questions = new Map();
  for (const result of results) {
    if (result.status !== 'fulfilled' || !Array.isArray(result.value)) continue;
    for (const question of result.value) questions.set(question.id, question);
  }
  return questions;
}
