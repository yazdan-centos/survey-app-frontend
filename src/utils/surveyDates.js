import DateObject from 'react-date-object';
import gregorian from 'react-date-object/calendars/gregorian.js';
import gregorianEn from 'react-date-object/locales/gregorian_en.js';

// Keep the selected local time, then serialize the corresponding UTC instant.
export function surveyDateToIso(value) {
  if (!value) return undefined;
  if (!(value instanceof DateObject) || !value.isValid) {
    throw new Error('تاریخ انتخاب‌شده معتبر نیست.');
  }
  return new DateObject(value)
    .convert(gregorian, gregorianEn)
    .set({ second: 0, millisecond: 0 })
    .toDate()
    .toISOString();
}
