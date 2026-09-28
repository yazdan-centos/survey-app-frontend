/**
 * Default data source for <QuestionDataTable />.
 *
 * Talks to a Spring Data JPA search endpoint and expects back a
 * `Page<QuestionResponseDto>` shaped exactly like the sample response:
 *   { content, totalPages, totalElements, number, size, numberOfElements,
 *     first, last, empty, sort, pageable }
 *
 * The backend's SurveyQuestionSpecification.search(...) already understands
 * these filter keys: q, code, text, role, displayOrder, surveyId,
 * surveyTitle, surveyVersion, surveyActive, criterionId, criterionName,
 * dimensionId, dimensionKey, dimensionLabel, dimensionDisplayOrder,
 * levelId, levelNumber, description (level description), levelTitle,
 * levelScore, createdAtFrom/To, updatedAtFrom/To.
 *
 * NOTE: as of this component's creation, QuestionController does not yet
 * expose a route for that specification (only POST /api/questions,
 * GET /api/questions/survey/{id}, import/export exist). Point `endpoint`
 * at whatever route ends up wired to QuestionService + the specification
 * (e.g. GET /api/questions/search), or pass a custom `fetcher` prop into
 * <QuestionDataTable /> if the contract ends up different (POST body, etc).
 */
const DEFAULT_ENDPOINT = 'http://localhost:8080/api/questions/search';

export async function fetchQuestions(
  { page, size, sort, filters },
  { endpoint = DEFAULT_ENDPOINT, signal } = {}
) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));

  sort.forEach(({ property, direction }) => {
    params.append('sort', `${property},${direction}`);
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
