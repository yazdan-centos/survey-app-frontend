import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getDemographicQuestions } from '../../data/demographics';

/**
 * Renders the role-specific demographic questionnaire using React Hook Form.
 * Every question is a required single-select (radio group) built dynamically
 * from data/demographics.json — no hardcoded fields.
 *
 * Questions are shown one per page. Answering the current question (Next)
 * advances the page; Previous steps back. Next is disabled/grayed on the
 * last question, where the Start Survey submit button appears as soon as
 * every demographic question has an answer.
 */
export default function DemographicForm({ demoKey, defaultValues, onValid }) {
  const questions = getDemographicQuestions(demoKey);
  const [pageIndex, setPageIndex] = useState(0);
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({ defaultValues, mode: 'onChange' });

  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === questions.length - 1;
  const currentQuestion = questions[pageIndex];
  const fieldName = `q${pageIndex}`;
  const currentAnswer = watch(fieldName);
  const hasCurrentAnswer = currentAnswer !== undefined && currentAnswer !== null && currentAnswer !== '';

  const handlePrevious = () => {
    setPageIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = async () => {
    // Validate only the currently visible question before advancing.
    const isValid = await trigger(fieldName);
    if (isValid) {
      setPageIndex((i) => Math.min(questions.length - 1, i + 1));
    }
  };

  if (!currentQuestion) return null;

  return (
      <form onSubmit={handleSubmit(onValid)} className="space-y-6" noValidate>
        <fieldset key={fieldName} className="space-y-2">
          <legend className="text-sm font-medium text-slate-800">
            {pageIndex + 1}. {currentQuestion.question}
          </legend>
          {currentQuestion.type === 'select' ? (
              <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
                  {...register(fieldName, { required: true })}
              >
                <option value="" disabled>
                  انتخاب کنید...
                </option>
                {currentQuestion.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                ))}
              </select>
          ) : (
              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((opt) => (
                    <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 has-[:checked]:border-primary-700 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-900"
                    >
                      <input
                          type="radio"
                          value={opt}
                          className="h-4 w-4 accent-primary-700"
                          {...register(fieldName, { required: true })}
                      />
                      {opt}
                    </label>
                ))}
              </div>
          )}
          {errors[fieldName] && (
              <p className="text-xs text-rose-600" role="alert">
                پاسخ به این سؤال الزامی است.
              </p>
          )}
        </fieldset>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirstPage}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
            قبلی
          </button>

          <span className="text-xs text-slate-400">
          سؤال {pageIndex + 1} از {questions.length}
        </span>

          {isLastPage ? (
              <button
                  type="submit"
                  disabled={!hasCurrentAnswer}
                  aria-hidden={!hasCurrentAnswer}
                  className={[
                    'inline-flex items-center gap-2 rounded-lg bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-900',
                    hasCurrentAnswer ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0',
                  ].join(' ')}
              >
                شروع پیمایش
                <ChevronLeft size={16} />
              </button>
          ) : (
              <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                بعدی
                <ChevronLeft size={16} />
              </button>
          )}
        </div>
      </form>
  );
}
