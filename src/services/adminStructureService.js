import { API_PATHS } from '../config/api';

function requiredText(value, maximum, label) {
  const text = String(value ?? '').trim();
  if (!text || text.length > maximum) throw new Error(`${label} الزامی است و باید حداکثر ${maximum} نویسه باشد.`);
  return text;
}

function dimensionPayload(value) {
  const key = requiredText(value.key, 80, 'کلید بُعد');
  const label = requiredText(value.label, 200, 'عنوان بُعد');
  const displayOrder = Number(value.displayOrder);
  if (String(value.displayOrder ?? '').trim() === '' || !Number.isInteger(displayOrder) || displayOrder < -2147483648 || displayOrder > 2147483647) {
    throw new Error('ترتیب نمایش باید عدد صحیح معتبر باشد.');
  }
  return { key, label, displayOrder };
}

function criterionPayload(value) {
  const name = requiredText(value.name, 200, 'نام معیار');
  const dimensionId = String(value.dimensionId ?? '').trim();
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(dimensionId)) {
    throw new Error('یک بُعد معتبر انتخاب کنید.');
  }
  return { name, dimensionId };
}

async function readList(request, path, signal) {
  const data = await request(path, { method: 'GET', signal });
  if (!Array.isArray(data)) throw new Error('ساختار فهرست دریافتی معتبر نیست.');
  return data;
}

export const dimensionService = {
  list: (request, { signal } = {}) => readList(request, API_PATHS.dimensions, signal),
  create: (request, payload) => request(API_PATHS.dimensions, { method: 'POST', body: dimensionPayload(payload) }),
  update: (request, id, payload) => request(API_PATHS.dimension(id), { method: 'PUT', body: dimensionPayload(payload) }),
  remove: (request, id) => request(API_PATHS.dimension(id), { method: 'DELETE' }),
};

export const criterionService = {
  list: (request, { dimensionId, signal } = {}) => readList(request,
    dimensionId ? `${API_PATHS.criteria}?dimensionId=${encodeURIComponent(dimensionId)}` : API_PATHS.criteria, signal),
  create: (request, payload) => request(API_PATHS.criteria, { method: 'POST', body: criterionPayload(payload) }),
  update: (request, id, payload) => request(API_PATHS.criterion(id), { method: 'PUT', body: criterionPayload(payload) }),
  remove: (request, id) => request(API_PATHS.criterion(id), { method: 'DELETE' }),
};
