import { API_PATHS } from '../../config/api';
// Guide requests use the application's authenticated HTTP layer.
// Assumed endpoints:
//   GET  /api/guides/:id  -> guide
//   POST /api/guides      -> created guide
//   PUT  /api/guides/:id  -> updated guide
// Validation failures: 422 { message, errors: { "title": "…", "sections.0.title": "…" } }

const BASE_URL = API_PATHS.guides;

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request(http, url, options = {}) {
  try {
    return await http(url, options);
  } catch (err) {
    if (err.name === "AbortError") throw err;
    const fieldErrors = Object.fromEntries(Object.entries(err.data?.errors ?? {}).map(
      ([field, messages]) => [field, Array.isArray(messages) ? messages.join(' ') : String(messages)],
    ));
    throw new ApiError(err.message, { status: err.status, fieldErrors });
  }

}

export const guideApi = {
  list: async (http, signal) => {
    const data = await request(http, BASE_URL, { signal });
    if (!Array.isArray(data)) throw new ApiError('ساختار فهرست راهنماها معتبر نیست.');
    return data;
  },
  get: (http, id, signal) => request(http, API_PATHS.guide(id), { signal }),
  create: (http, data) => request(http, BASE_URL, { method: "POST", body: data }),
  update: (http, id, data) => request(http, API_PATHS.guide(id), { method: "PUT", body: data }),
};
