import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';
import persian from 'react-date-object/calendars/persian.js';
import persianFa from 'react-date-object/locales/persian_fa.js';
let vite;
let DateObject;
let surveyDateToIso;

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null, hmr: false },
    ssr: {
      noExternal: [/^react-date-object$/],
      external: ['react-date-object/calendars/gregorian.js', 'react-date-object/locales/gregorian_en.js'],
    },
  });
  ({ surveyDateToIso } = await vite.ssrLoadModule('/src/utils/surveyDates.js'));
  ({ default: DateObject } = await vite.ssrLoadModule('react-date-object'));
});
after(async () => { await vite?.close(); });

test('Shamsi New Year converts to Gregorian while preserving local hours and minutes', () => {
  const value = new DateObject({
    calendar: persian, locale: persianFa,
    year: 1405, month: 1, day: 1, hour: 14, minute: 35, second: 42, millisecond: 123,
  });
  const original = value.format('YYYY/MM/DD HH:mm:ss');
  assert.equal(surveyDateToIso(value), new Date(2026, 2, 21, 14, 35).toISOString());
  assert.equal(value.calendar.name, 'persian');
  assert.equal(value.format('YYYY/MM/DD HH:mm:ss'), original);
});

test('Persian leap day converts correctly across the year boundary', () => {
  const value = new DateObject({ calendar: persian, year: 1403, month: 12, day: 30, hour: 23, minute: 59 });
  assert.equal(surveyDateToIso(value), new Date(2025, 2, 20, 23, 59).toISOString());
  value.add(1, 'day');
  assert.equal(surveyDateToIso(value), new Date(2025, 2, 21, 23, 59).toISOString());
});

test('optional dates stay omitted and invalid values cannot reach the API', () => {
  assert.equal(surveyDateToIso(null), undefined);
  assert.equal(surveyDateToIso(undefined), undefined);
  assert.throws(() => surveyDateToIso('1405/01/01'), /معتبر نیست/);
  assert.throws(() => surveyDateToIso(new DateObject({ date: 'invalid' })), /معتبر نیست/);
});
