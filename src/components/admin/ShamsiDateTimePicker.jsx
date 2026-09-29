import DatePickerModule from 'react-multi-date-picker';
import TimePickerModule from 'react-multi-date-picker/plugins/time_picker';
import persian from 'react-date-object/calendars/persian';
import persianFa from 'react-date-object/locales/persian_fa';

// Support both CommonJS module wrappers and direct component exports.
const DatePicker = DatePickerModule.default ?? DatePickerModule;
const TimePicker = TimePickerModule.default ?? TimePickerModule;

export default function ShamsiDateTimePicker({ id, value, onChange, disabled }) {
  return (
    <div className="flex min-w-0 items-center gap-1" dir="rtl">
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        calendar={persian}
        locale={persianFa}
        format="YYYY/MM/DD HH:mm"
        editable={false}
        disabled={disabled}
        placeholder="انتخاب تاریخ و ساعت"
        calendarPosition="bottom-right"
        containerClassName="min-w-0 flex-1"
        className="survey-date-picker"
        inputClass="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-left focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 disabled:opacity-60"
        plugins={[<TimePicker key="time" position="bottom" hideSeconds />]}
      />
      {value && (
        <button type="button" disabled={disabled} onClick={() => onChange(null)}
          aria-label="پاک کردن تاریخ و ساعت" className="shrink-0 rounded-lg p-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          پاک
        </button>
      )}
    </div>
  );
}
