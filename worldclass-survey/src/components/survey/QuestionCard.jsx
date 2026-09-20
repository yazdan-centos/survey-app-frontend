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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">
            {question.criterion} در سازمان شما در چه سطحی است؟
          </h3>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
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

      <QuestionTypeRenderer type="maturityLevels" question={question} value={value} onChange={onChange} accentColor={accentColor} />

      {allowSkip && (
        <div className="mt-3 text-left">
          <button
            type="button"
            onClick={() => onChange('skip')}
            className={[
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              value === 'skip'
                ? 'border-slate-400 bg-slate-100 text-slate-700'
                : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600',
            ].join(' ')}
          >
            اطلاعات کافی برای ارزیابی این موضوع ندارم
          </button>
        </div>
      )}
    </div>
  );
}
