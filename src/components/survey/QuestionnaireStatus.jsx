import {useSurvey} from '../../context/SurveyContext';

export default function QuestionnaireStatus({children, requireRoleQuestions = true}) {
    const {
        survey,
        questionsLoading,
        questionsError,
        reloadQuestions,
        availableRoleIds,
        dimensionsWithQuestions
    } = useSurvey();
    let message = '';
    if (questionsLoading)
        message = 'در حال دریافت سؤال‌های پیمایش…';
    else if (questionsError)
        message = questionsError;
    else if (!survey)
        message = 'در حال حاضر پیمایش فعالی وجود ندارد.';
    else if (!availableRoleIds.length)
        message = 'هنوز سؤالی برای این پیمایش ثبت نشده است.';
    else if (requireRoleQuestions && !dimensionsWithQuestions.length)
        message = 'برای نقش شما سؤالی در این پیمایش ثبت نشده است.';

    if (!message) return children;
    return (
        <div className="mx-auto max-w-3xl px-4 py-12 text-center text-slate-700 dark:text-slate-300">
            <p role={questionsError ? 'alert' : 'status'}>{message}</p>
            {!questionsLoading &&
                <button
                    type="button"
                    onClick={reloadQuestions}
                    className="mt-4 rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white">
                    دریافت
                دوباره سؤال‌ها
                </button>
            }
        </div>
    );
}
