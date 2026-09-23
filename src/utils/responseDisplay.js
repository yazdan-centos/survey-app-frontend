import { ROLES } from '../data/roles';

export function responseRoleLabel(role) {
  return ROLES.find((item) => item.id === String(role).toLowerCase())?.label ?? role ?? '—';
}

export function responseDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('fa-IR');
}

export function responseNumber(value) {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString('fa-IR', { maximumFractionDigits: 2 }) : '—';
}
