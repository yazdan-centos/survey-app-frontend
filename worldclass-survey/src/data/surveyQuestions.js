import raw from './surveyQuestions.json';
import { DIMENSIONS } from './dimensions';

// raw[roleId] -> array of { code, dimensionKey, dimensionLabel, criterion, levels: [L1..L4] }
// This helper groups a role's flat question list into per-dimension buckets,
// preserving the DIMENSIONS display order.
export function getQuestionsByRole(roleId) {
  const flat = raw[roleId] || [];
  return DIMENSIONS.map((dim) => ({
    ...dim,
    questions: flat.filter((q) => q.dimensionKey === dim.key),
  }));
}

export function getFlatQuestions(roleId) {
  return raw[roleId] || [];
}

export function getTotalQuestionCount(roleId) {
  return (raw[roleId] || []).length;
}

export default raw;
