import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { fetchQuestions } from '../../config/questionsApi.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import './QuestionDataTable.css';

const ROLE_OPTIONS = ['MANAGERS', 'BOARD', 'CUSTOMERS', 'SUPPLIERS'];
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const COLUMNS = [
  { key: 'code', label: 'Code', sortProperty: 'code', filterKey: 'code', filterType: 'text', width: '108px', mono: true },
  { key: 'text', label: 'Question', sortProperty: 'text', filterKey: 'text', filterType: 'text' },
  { key: 'role', label: 'Role', sortProperty: 'role', filterKey: 'role', filterType: 'select', width: '128px' },
  { key: 'displayOrder', label: 'Order', sortProperty: 'displayOrder', filterKey: null, filterType: null, width: '76px', align: 'right' },
  { key: 'criterionName', label: 'Criterion', sortProperty: 'criterion.name', filterKey: 'criterionName', filterType: 'text' },
  { key: 'dimension', label: 'Dimension', sortProperty: 'criterion.dimension.label', filterKey: 'dimensionLabel', filterType: 'text' },
  { key: 'levels', label: 'Levels', sortProperty: null, filterKey: null, filterType: null, width: '92px', align: 'center' },
];

const EMPTY_FILTERS = { q: '', code: '', text: '', role: '', criterionName: '', dimensionLabel: '' };

const EMPTY_PAGE = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: 20,
  numberOfElements: 0,
  first: true,
  last: true,
  empty: true,
};

function getPageWindow(current, totalPages, windowSize = 5) {
  if (totalPages <= 0) return [];
  const half = Math.floor(windowSize / 2);
  let start = Math.max(0, current - half);
  const end = Math.min(totalPages - 1, start + windowSize - 1);
  start = Math.max(0, end - windowSize + 1);
  const pages = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
}

/**
 * Searchable, sortable, paginated table for the Question list.
 *
 * @param {Object} props
 * @param {string} [props.endpoint] - overrides the default fetch endpoint
 * @param {(args: {page:number,size:number,sort:Array,filters:Object}, opts: {signal:AbortSignal}) => Promise<Object>} [props.fetcher]
 *   - swap out the data source entirely (e.g. a POST search endpoint)
 * @param {number} [props.initialPageSize]
 */
export default function QuestionDataTable({ endpoint, fetcher = fetchQuestions, initialPageSize = 20 }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortOrders, setSortOrders] = useState([]); // [{ property, direction }]
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const [pageData, setPageData] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const debouncedFilters = useDebouncedValue(filters, 350);
  const didMountRef = useRef(false);

  // Jump back to page 0 whenever the active filters or page size change.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setPage(0);
  }, [debouncedFilters, pageSize]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetcher(
      { page, size: pageSize, sort: sortOrders, filters: debouncedFilters },
      { endpoint, signal: controller.signal }
    )
      .then((data) => setPageData(data))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load questions.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, pageSize, sortOrders, debouncedFilters, fetcher, endpoint, refreshToken]);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== ''),
    [filters]
  );

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  function handleSort(column, event) {
    if (!column.sortProperty) return;
    const multi = event.shiftKey;

    setSortOrders((prev) => {
      const idx = prev.findIndex((o) => o.property === column.sortProperty);

      if (!multi) {
        if (idx === -1) return [{ property: column.sortProperty, direction: 'asc' }];
        return prev[idx].direction === 'asc'
          ? [{ property: column.sortProperty, direction: 'desc' }]
          : [];
      }

      if (idx === -1) return [...prev, { property: column.sortProperty, direction: 'asc' }];
      const next = [...prev];
      if (next[idx].direction === 'asc') {
        next[idx] = { ...next[idx], direction: 'desc' };
        return next;
      }
      next.splice(idx, 1);
      return next;
    });
  }

  function toggleExpanded(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const rows = pageData.content ?? [];
  const startIndex = pageData.numberOfElements === 0 ? 0 : page * pageSize + 1;
  const endIndex = page * pageSize + (pageData.numberOfElements ?? 0);
  const pageWindow = getPageWindow(pageData.number ?? 0, pageData.totalPages ?? 0);

  return (
    <div className="qdt">
      <div className="qdt-toolbar">
        <div className="qdt-search">
          <svg className="qdt-search-icon" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <line x1="13.2" y1="13.2" x2="18" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={filters.q}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder="Search code, text, criterion, dimension, level description…"
            aria-label="Search all questions"
          />
        </div>

        <div className="qdt-toolbar-right">
          {hasActiveFilters && (
            <button type="button" className="qdt-link-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
          <label className="qdt-page-size">
            Rows
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="qdt-table-scroll">
        <table className="qdt-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => {
                const orderIdx = sortOrders.findIndex((o) => o.property === col.sortProperty);
                const order = orderIdx !== -1 ? sortOrders[orderIdx] : null;
                const ariaSort = !col.sortProperty ? undefined : order ? (order.direction === 'asc' ? 'ascending' : 'descending') : 'none';

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width, textAlign: col.align ?? 'left' }}
                    aria-sort={ariaSort}
                  >
                    {col.sortProperty ? (
                      <button
                        type="button"
                        className="qdt-th-btn"
                        onClick={(e) => handleSort(col, e)}
                        title="Click to sort, shift-click to add a secondary sort"
                      >
                        <span>{col.label}</span>
                        <span className="qdt-sort-indicator" aria-hidden="true">
                          {order && (order.direction === 'asc' ? '▲' : '▼')}
                          {sortOrders.length > 1 && order && (
                            <sup className="qdt-sort-priority">{orderIdx + 1}</sup>
                          )}
                        </span>
                      </button>
                    ) : (
                      <span className="qdt-th-label">{col.label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
            <tr className="qdt-filter-row">
              {COLUMNS.map((col) => (
                <th key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                  {col.filterType === 'text' && (
                    <input
                      type="text"
                      value={filters[col.filterKey]}
                      onChange={(e) => updateFilter(col.filterKey, e.target.value)}
                      placeholder="Filter…"
                      aria-label={`Filter by ${col.label}`}
                    />
                  )}
                  {col.filterType === 'select' && (
                    <select
                      value={filters[col.filterKey]}
                      onChange={(e) => updateFilter(col.filterKey, e.target.value)}
                      aria-label={`Filter by ${col.label}`}
                    >
                      <option value="">All</option>
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {error && (
              <tr>
                <td colSpan={COLUMNS.length} className="qdt-state qdt-state--error">
                  <span>{error}</span>
                  <button type="button" className="qdt-link-btn" onClick={() => setRefreshToken((t) => t + 1)}>
                    Retry
                  </button>
                </td>
              </tr>
            )}

            {!error && loading && (
              Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="qdt-skeleton-row">
                  {COLUMNS.map((col) => (
                    <td key={col.key}><span className="qdt-skeleton" /></td>
                  ))}
                </tr>
              ))
            )}

            {!error && !loading && rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="qdt-state">
                  {hasActiveFilters
                    ? 'No questions match your filters.'
                    : 'No questions yet.'}
                  {hasActiveFilters && (
                    <button type="button" className="qdt-link-btn" onClick={clearFilters}>
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            )}

            {!error && !loading && rows.map((q) => {
              const isExpanded = expandedIds.has(q.id);
              const levels = [...(q.levels ?? [])].sort((a, b) => a.levelNumber - b.levelNumber);

              return (
                <Fragment key={q.id}>
                  <tr className="qdt-row">
                    <td className="qdt-mono">{q.code}</td>
                    <td className="qdt-text-cell">{q.text}</td>
                    <td>
                      <span className={`qdt-badge qdt-badge--${(q.role || '').toLowerCase()}`}>
                        {q.role}
                      </span>
                    </td>
                    <td className="qdt-mono" style={{ textAlign: 'right' }}>{q.displayOrder}</td>
                    <td>{q.criterionName}</td>
                    <td>
                      <div className="qdt-dimension-label">{q.dimension?.label}</div>
                      <div className="qdt-dimension-key">{q.dimension?.key}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className={`qdt-expand-btn${isExpanded ? ' qdt-expand-btn--open' : ''}`}
                        onClick={() => toggleExpanded(q.id)}
                        disabled={levels.length === 0}
                        aria-expanded={isExpanded}
                      >
                        {levels.length} <span className="qdt-chevron">▸</span>
                      </button>
                    </td>
                  </tr>
                  {isExpanded && levels.length > 0 && (
                    <tr className="qdt-detail-row" key={`${q.id}-levels`}>
                      <td colSpan={COLUMNS.length}>
                        <table className="qdt-levels-table">
                          <thead>
                            <tr>
                              <th style={{ width: '72px' }}>Level</th>
                              <th>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {levels.map((lvl) => (
                              <tr key={lvl.id}>
                                <td className="qdt-mono">{lvl.levelNumber}</td>
                                <td>{lvl.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="qdt-footer">
        <div className="qdt-footer-count">
          {pageData.totalElements > 0
            ? `Showing ${startIndex}–${endIndex} of ${pageData.totalElements}`
            : loading ? 'Loading…' : 'No results'}
        </div>

        <div className="qdt-pagination">
          <button type="button" onClick={() => setPage(0)} disabled={pageData.first}>« First</button>
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={pageData.first}>‹ Prev</button>

          {pageWindow.map((p) => (
            <button
              key={p}
              type="button"
              className={p === pageData.number ? 'qdt-page-btn qdt-page-btn--active' : 'qdt-page-btn'}
              onClick={() => setPage(p)}
            >
              {p + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min((pageData.totalPages || 1) - 1, p + 1))}
            disabled={pageData.last}
          >
            Next ›
          </button>
          <button
            type="button"
            onClick={() => setPage((pageData.totalPages || 1) - 1)}
            disabled={pageData.last}
          >
            Last »
          </button>
        </div>
      </div>
    </div>
  );
}
