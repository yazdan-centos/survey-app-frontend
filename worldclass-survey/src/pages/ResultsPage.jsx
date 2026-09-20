import { useRef, useState } from 'react';
import { CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { useSurvey } from '../context/SurveyContext';
import { useHttp } from '../hooks/useHttp';
import { useAuth } from '../hooks/useAuth';
import { submitSurveyResponse } from '../services/surveyService';
import RadarScoreChart from '../components/results/RadarScoreChart';
import DimensionBarChart from '../components/results/DimensionBarChart';
import LevelDistribution from '../components/results/LevelDistribution';
import ExportButtons from '../components/results/ExportButtons';
import { scoreToLevelLabel, scoreToPercent } from '../utils/scoring';

export default function ResultsPage() {
  const { role, state, dimensionScores, overallAverage, levelDistribution, resetSurvey, finishSurvey } = useSurvey();
  const { user } = useAuth();
  const request = useHttp();
  const dashboardRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const handleFinish = async () => {
    setIsSubmitting(true);
    setSubmissionError('');

    const payload = {
      surveyVersion: 1,
      submittedAt: state.submittedAt ?? new Date().toISOString(),
      respondent: {
        userId: user?.id ?? null,
        roleId: role?.id ?? state.roleId,
        roleLabel: role?.label ?? null,
        demographics: state.demographics,
      },
      answers: state.answers,
      results: {
        overallAverage,
        dimensions: dimensionScores.map((dimension) => ({
          key: dimension.key,
          label: dimension.label,
          average: dimension.average,
          answered: dimension.answered,
          total: dimension.total,
          skipped: dimension.skipped,
        })),
        levelDistribution,
      },
    };

    try {
      await submitSurveyResponse(request, payload);
      finishSurvey();
    } catch (error) {
      setSubmissionError(
        error.status === 0
          ? 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.'
          : (error.message || 'ارسال پرسشنامه با خطا مواجه شد. لطفاً دوباره تلاش کنید.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">داشبورد نتایج پیمایش</h2>
            <p className="mt-1 text-sm text-slate-500">
              نتایج بر اساس پاسخ‌های شما به‌عنوان «{role?.label}» محاسبه شده است.
            </p>
          </div>
          <ExportButtons
              dashboardRef={dashboardRef}
              role={role}
              demographics={state.demographics}
              dimensionScores={dimensionScores}
              overallAverage={overallAverage}
              submittedAt={state.submittedAt}
          />
        </div>

        <div ref={dashboardRef} className="space-y-6 bg-slate-50 p-1">
          {/* Overall score hero */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-medium text-slate-500">میانگین کلی امتیاز شرکت</p>
            <p className="mt-2 text-5xl font-extrabold text-primary-800">{overallAverage.toFixed(2)}</p>
            <p className="text-sm text-slate-400">از ۴.۰۰</p>
            <p className="mt-3 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-800">
              {scoreToLevelLabel(overallAverage)}
            </p>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">نمودار راداری ابعاد پنج‌گانه</h3>
              <RadarScoreChart dimensionScores={dimensionScores} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">مقایسه میانگین امتیاز هر بُعد</h3>
              <DimensionBarChart dimensionScores={dimensionScores} />
            </div>
          </div>

          {/* Dimension breakdown table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">جزئیات هر بُعد</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {dimensionScores.map((d) => (
                  <div key={d.key} className="rounded-xl border border-slate-100 p-4">
                    <div
                        className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: d.color }}
                    >
                      <d.icon size={16} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{d.label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">{d.average.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{scoreToPercent(d.average)}٪ از حداکثر امتیاز</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {d.answered} از {d.total} معیار پاسخ داده شده
                      {d.skipped > 0 && ` · ${d.skipped} بدون اطلاعات کافی`}
                    </p>
                  </div>
              ))}
            </div>
          </div>

          {/* Level distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">توزیع سطوح انتخاب‌شده</h3>
            <LevelDistribution distribution={levelDistribution} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {isSubmitting ? 'در حال ارسال...' : 'پایان و ارسال پرسشنامه'}
          </button>
          <button
              type="button"
              onClick={resetSurvey}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <RotateCcw size={16} />
            شروع پیمایش جدید
          </button>
        </div>
        {submissionError && (
            <p className="mt-3 text-center text-sm text-rose-600" role="alert">
              {submissionError}
            </p>
        )}
      </div>
  );
}
