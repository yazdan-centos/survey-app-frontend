import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useSurvey } from '../context/SurveyContext';

export default function ThankYouPage() {
  const { resetSurvey } = useSurvey();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <CheckCircle2 className="mx-auto text-primary-800" size={64} strokeWidth={1.5} />
        <h2 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">از همراهی شما سپاسگزاریم</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-slate-600 sm:text-base">
          پرسشنامه با موفقیت به پایان رسید. از زمانی که برای پاسخ‌گویی و بهبود سازمان اختصاص دادید، صمیمانه تشکر می‌کنیم.
        </p>
        <button
          type="button"
          onClick={resetSurvey}
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <RotateCcw size={16} />
          شروع پرسشنامه جدید
        </button>
      </div>
    </div>
  );
}
