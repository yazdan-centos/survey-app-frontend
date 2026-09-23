import { API_PATHS } from '../config/api';

export async function listUsers(request, { signal } = {}) {
  const data = await request(API_PATHS.users, { signal });
  // The all-users endpoint may return a list or a wrapped list.
  const users = Array.isArray(data) ? data : data?.items ?? data?.content;
  if (!Array.isArray(users)) throw new Error('ساختار پاسخ فهرست کاربران معتبر نیست.');
  return users;
}

export function createUser(request, payload) {
  return request(API_PATHS.users, { method: 'POST', body: payload });
}

export function updateUser(request, id, payload) {
  return request(API_PATHS.user(encodeURIComponent(id)), { method: 'PUT', body: payload });
}

export function deleteUser(request, id) {
  return request(API_PATHS.user(encodeURIComponent(id)), { method: 'DELETE' });
}
