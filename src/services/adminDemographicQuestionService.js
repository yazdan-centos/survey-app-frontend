import { API_PATHS } from '../config/api';

const MAX_GROUP_KEY = 30;
const MAX_TYPE = 20;

// The three demographic groups the survey currently assigns respondents to
// (see src/data/roles.js demoKey values). groupKey itself is free-form on
// the backend, so this is only used to suggest sensible values in the UI.
export const KNOWN_GROUP_KEYS = [
  { value: 'managers', label: 'معاونین و مدیران' },
  { value: 'board', label: 'اعضای هیأت مدیره' },
  { value: 'stakeholders', label: 'مشتریان و پیمانکاران (ذی‌نفعان)' },
];

export const QUESTION_TYPES = [
  { value: '', label: 'تک‌انتخابی (رادیویی)' },
  { value: 'select', label: 'کشویی (Select)' },
];

function requiredText(value, maximum, label) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${label} الزامی است.`);
  if (text.length > maximum) throw new Error(`${label} باید حداکثر ${maximum} نویسه باشد.`);
  return text;
}

function optionalType(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  if (text.length > MAX_TYPE) throw new Error(`نوع سؤال باید حداکثر ${MAX_TYPE} نویسه باشد.`);
  return text;
}

function displayOrderValue(value) {
  const displayOrder = Number(value);
  if (String(value ?? '').trim() === '' || !Number.isInteger(displayOrder) || displayOrder < 0) {
    throw new Error('ترتیب نمایش باید عدد صحیح نامنفی باشد.');
  }
  return displayOrder;
}

function optionsValue(value) {
  const options = (Array.isArray(value) ? value : [])
    .map((option) => String(option ?? '').trim())
    .filter((option) => option.length > 0);
  if (!options.length) throw new Error('حداقل یک گزینه الزامی است.');
  return options;
}

function demographicQuestionPayload(value) {
  return {
    groupKey: requiredText(value.groupKey, MAX_GROUP_KEY, 'کلید گروه'),
    question: requiredText(value.question, 10000, 'متن سؤال'),
    type: optionalType(value.type),
    displayOrder: displayOrderValue(value.displayOrder),
    options: optionsValue(value.options),
  };
}

async function readList(request, path, signal) {
  const data = await request(path, { method: 'GET', signal });
  if (!Array.isArray(data)) throw new Error('ساختار فهرست دریافتی معتبر نیست.');
  return data;
}

export const demographicQuestionService = {
  list: (request, { signal } = {}) => readList(request, API_PATHS.demographicQuestions, signal),
  listByGroupKey: (request, groupKey, { signal } = {}) =>
    readList(request, API_PATHS.demographicQuestionsByGroup(groupKey), signal),
  create: (request, payload) =>
    request(API_PATHS.demographicQuestions, { method: 'POST', body: demographicQuestionPayload(payload) }),
  update: (request, id, payload) =>
    request(API_PATHS.demographicQuestion(id), { method: 'PUT', body: demographicQuestionPayload(payload) }),
  remove: (request, id) => request(API_PATHS.demographicQuestion(id), { method: 'DELETE' }),
};

// Downloads the server-generated .xlsx template (groupKey, question, type,
// displayOrder, option1..option13 columns) and saves it via the browser.
export async function downloadDemographicQuestionsTemplate(request) {
  const { blob, filename } = await request(API_PATHS.demographicQuestionsTemplate, {
    method: 'GET',
    responseType: 'blob',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'demographic-questions-template.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Uploads a filled-in workbook; the backend parses and persists every row
// in one transaction and returns the created questions.
export async function importDemographicQuestionsFile(request, file) {
  if (!file) throw new Error('انتخاب فایل اکسل الزامی است.');
  const formData = new FormData();
  formData.append('file', file);
  const data = await request(API_PATHS.importDemographicQuestions, { method: 'POST', body: formData });
  if (!Array.isArray(data)) throw new Error('ساختار پاسخ ورود اطلاعات معتبر نیست.');
  return data;
}
