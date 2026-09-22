import { ArrowLeft, ArrowRight } from 'lucide-react';
import QuestionTypeRenderer from '../questionTypes/QuestionTypeRenderer';

export default function QuestionCard({
  question,
  value,
  onChange,
  accentColor,
  allowSkip,
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
            {question.criterion} در سازمان شما در چه سطحی است؟
          </h3>
        </div>
      </div>

      <QuestionTypeRenderer type="maturityLevels" question={question} value={value} onChange={onChange} accentColor={accentColor} />

      {allowSkip && (
        <div className="mt-3 text-left">
          <button
            type="button"
            onClick={() => onChange('skip')}
            className={[
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              value === 'skip'
                ? 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:text-slate-400',
            ].join(' ')}
          >
            اطلاعات کافی برای ارزیابی این موضوع ندارم
          </button>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:bg-slate-800"
        >
          <ArrowRight size={16} />
          بازگشت
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel}
          <ArrowLeft size={16} />
        </button>
      </div>
    </div>
  );
}
