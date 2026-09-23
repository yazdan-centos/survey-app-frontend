import { API_PATHS } from '../config/api';
import { httpRequest } from './httpService';

export function login(credentials) {
  return httpRequest(API_PATHS.login, {
    method: 'POST',
    body: credentials,
  });
}

export function getCurrentUser(token) {
  return httpRequest(API_PATHS.currentUser, { token });
}
