import {useState} from 'react';
import {useSurvey} from '../context/SurveyContext';
import {useParams} from 'react-router-dom';
import QuestionnaireStatus from '../components/survey/QuestionnaireStatus';
import DimensionStepper from '../components/layout/DimensionStepper';
import ProgressBar from '../components/layout/ProgressBar';
import QuestionCard from '../components/survey/QuestionCard';
import ManagerGuide from '../components/guides/ManagerGuide';

export default function SurveyPage() {
    return <QuestionnaireStatus>
            <SurveyQuestions/>
            </QuestionnaireStatus>;
}

function SurveyQuestions() {
    const {dimensionKey} = useParams();
  const { state, role, dimensionsWithQuestions, answerQuestion, acknowledgeManagerGuide, goToStep, finishSurvey, progressPercent } =
      useSurvey();
  const [questionPage, setQuestionPage] = useState({ dimensionKey, index: 0 });

    const dimIndex = dimensionsWithQuestions.findIndex((dimension) => dimension.key === dimensionKey);
  const dimension = dimensionsWithQuestions.find((d) => d.key === dimensionKey);

  const isFirst = dimIndex === 0;
    const isLast = dimIndex === dimensionsWithQuestions.length - 1;

    if (!dimension) return <div className="mx-auto max-w-3xl p-8 text-center text-slate-700 dark:text-slate-300">
        <p>بُعد انتخاب‌شده در این پیمایش وجود ندارد.</p>
        <button type="button" onClick={() => goToStep('profile')}
                className="mt-4 text-primary-700 underline dark:text-primary-300">بازگشت به شروع پیمایش
        </button>
    </div>;

  const shouldShowManagerGuide =
    isFirst && !state.managerGuideSeen && Object.keys(state.answers).length === 0;

  if (shouldShowManagerGuide) {
    return <ManagerGuide onContinue={acknowledgeManagerGuide} />;
  }

    const questionIndex = questionPage.dimensionKey === dimensionKey ? Math.min(questionPage.index, dimension.questions.length - 1) : 0;
  const currentQuestion = dimension.questions[questionIndex];
  const isFirstQuestion = questionIndex === 0;
  const isLastQuestion = questionIndex === dimension.questions.length - 1;
    const hasCurrentAnswer = state.answers[currentQuestion?.id] !== undefined;

  const handleNext = () => {
    if (!hasCurrentAnswer) return;

    if (!isLastQuestion) {
      setQuestionPage({ dimensionKey, index: questionIndex + 1 });
    } else if (isLast) {
      finishSurvey();
    } else {
        goToStep(dimensionsWithQuestions[dimIndex + 1].key);
    }
  };

  const handleBack = () => {
    if (!isFirstQuestion) {
      setQuestionPage({ dimensionKey, index: questionIndex - 1 });
    } else if (isFirst) {
      goToStep('profile');
    } else {
        goToStep(dimensionsWithQuestions[dimIndex - 1].key);
    }
  };

  return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-4">
          <DimensionStepper activeKey={dimensionKey} />
        </div>

        <div className="sticky top-0 z-30 -mx-4 mb-6 border-y border-slate-200 dark:border-slate-700 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6">
          <ProgressBar percent={progressPercent} label="پیشرفت کلی پیمایش" />
        </div>

        <div className="mb-5">
        <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: dimension.color }}
        >
          بُعد {dimIndex + 1} از {dimensionsWithQuestions.length}
        </span>
          <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{dimension.label}</h2>
        </div>

        <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            value={state.answers[currentQuestion.id]}
            onChange={(value) => answerQuestion(currentQuestion.id, value)}
            accentColor={dimension.color}
            allowSkip={role?.allowSkip}
            onBack={handleBack}
            onNext={handleNext}
            nextDisabled={!hasCurrentAnswer}
            nextLabel={
              isLastQuestion
                  ? (isLast ? 'پایان' : 'بُعد بعدی')
                  : 'بعدی'
            }
        />
      </div>
  );
}
