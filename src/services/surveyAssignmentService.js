import { API_PATHS } from '../config/api';

/**
 * Admin survey assignments.
 * `request` is the authenticated fetcher returned by useHttp().
 * The backend has no list endpoint, so callers keep the assignments returned here.
 */

export async function assignSurveys(request, { userIds, surveyIds, activeFrom, activeUntil }) {
    const data = await request(API_PATHS.surveyAssignments, {
        method: 'POST',
        body: {
            userIds,
            surveyIds,
            ...(activeFrom ? { activeFrom } : {}),
            ...(activeUntil ? { activeUntil } : {}),
        },
    });
    if (!Array.isArray(data)) throw new Error('ساختار پاسخ اختصاص پیمایش معتبر نیست.');
    return data;
}

export function revokeAssignment(request, assignmentId) {
    return request(API_PATHS.surveyAssignment(encodeURIComponent(assignmentId)), { method: 'DELETE' });
}