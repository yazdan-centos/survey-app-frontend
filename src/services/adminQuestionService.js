import { API_PATHS } from '../config/api';

export const QUESTION_ROLES = [
  { value: 'MANAGERS', label: 'مدیران' },
  { value: 'BOARD', label: 'هیئت مدیره' },
  { value: 'CUSTOMERS', label: 'مشتریان' },
  { value: 'SUPPLIERS', label: 'تأمین‌کنندگان' },
];
export const QUESTION_IMPORT_HEADERS = ['code', 'text', 'role', 'level_title', 'level_score', 'level_order'];

export function questionPayload(question) {
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(question.surveyId || '')) throw new Error('یک پیمایش معتبر انتخاب کنید.');
  const code = String(question.code ?? '').trim();
  const text = String(question.text ?? '').trim();
  if (!code || !text) throw new Error('کد و متن سؤال الزامی است.');
  if (!QUESTION_ROLES.some(({ value }) => value === question.role)) throw new Error('نقش پاسخ‌دهنده معتبر نیست.');
  const scores = new Set();
  const levels = (question.levels || []).map((level) => {
    const title = String(level.title ?? '').trim();
    const score = Number(level.score);
    const levelOrder = Number(level.levelOrder);
    if (!title || [level.score, level.levelOrder].some((value) => String(value ?? '').trim() === '') ||
        ![score, levelOrder].every((value) => Number.isInteger(value) && value >= -2147483648 && value <= 2147483647)) {
      throw new Error('عنوان سطح و امتیاز و ترتیب عدد صحیح را وارد کنید.');
    }
    if (scores.has(score)) throw new Error('امتیاز هر سطح در یک سؤال باید یکتا باشد.');
    scores.add(score);
    return { title, score, levelOrder };
  });
  return { surveyId: question.surveyId, code, text, role: question.role, levels };
}

export function parseQuestionRows(rows, surveyId) {
  if (!rows.length) throw new Error('فایل سؤال خالی است.');
  const groups = new Map();
  for (const [index, row] of rows.entries()) {
    if (QUESTION_IMPORT_HEADERS.some((header) => !(header in row))) throw new Error('ستون‌های فایل با قالب سؤال‌ها مطابقت ندارند.');
    const code = String(row.code).trim();
    const text = String(row.text).trim();
    const role = String(row.role).trim();
    const key = JSON.stringify([code, role]);
    const question = groups.get(key) || { surveyId, code, text, role, levels: [] };
    if (question.text !== text) throw new Error(`متن سؤال در ردیف ${index + 2} با ردیف‌های قبلی سازگار نیست.`);
    if ([row.level_title, row.level_score, row.level_order].some((value) => String(value ?? '').trim())) {
      question.levels.push({ title: row.level_title, score: row.level_score, levelOrder: row.level_order });
    }
    groups.set(key, question);
  }
  return [...groups.values()].map(questionPayload);
}

export function createQuestion(request, question) {
  return request(API_PATHS.questions, { method: 'POST', body: questionPayload(question) });
}
