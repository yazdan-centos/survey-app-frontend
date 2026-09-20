import { useState } from 'react';
import { useSurvey } from '../context/SurveyContext';
import { DIMENSIONS } from '../data/dimensions';
import DimensionStepper from '../components/layout/DimensionStepper';
import ProgressBar from '../components/layout/ProgressBar';
import QuestionCard from '../components/survey/QuestionCard';

export default function SurveyPage({ dimensionKey }) {
  const { state, role, dimensionsWithQuestions, answerQuestion, goToStep, progressPercent } =
      useSurvey();
  const [questionPage, setQuestionPage] = useState({ dimensionKey, index: 0 });

  const dimIndex = DIMENSIONS.findIndex((d) => d.key === dimensionKey);
  const dimension = dimensionsWithQuestions.find((d) => d.key === dimensionKey);

  const isFirst = dimIndex === 0;
  const isLast = dimIndex === DIMENSIONS.length - 1;

  if (!dimension) return null;

  const questionIndex = questionPage.dimensionKey === dimensionKey ? questionPage.index : 0;
  const currentQuestion = dimension.questions[questionIndex];
  const isFirstQuestion = questionIndex === 0;
  const isLastQuestion = questionIndex === dimension.questions.length - 1;
  const hasCurrentAnswer = state.answers[currentQuestion?.code] !== undefined;

  const handleNext = () => {
    if (!hasCurrentAnswer) return;

    if (!isLastQuestion) {
      setQuestionPage({ dimensionKey, index: questionIndex + 1 });
    } else if (isLast) {
      goToStep('results');
    } else {
      goToStep(DIMENSIONS[dimIndex + 1].key);
    }
  };

  const handleBack = () => {
    if (!isFirstQuestion) {
      setQuestionPage({ dimensionKey, index: questionIndex - 1 });
    } else if (isFirst) {
      goToStep('profile');
    } else {
      goToStep(DIMENSIONS[dimIndex - 1].key);
    }
  };

  return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6 space-y-4">
          <DimensionStepper activeKey={dimensionKey} />
          <ProgressBar percent={progressPercent} label="پیشرفت کلی پیمایش" />
        </div>

        <div className="mb-5">
        <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: dimension.color }}
        >
          بُعد {dimIndex + 1} از {DIMENSIONS.length}
        </span>
          <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">{dimension.label}</h2>
        </div>

        <QuestionCard
            key={currentQuestion.code}
            question={currentQuestion}
            value={state.answers[currentQuestion.code]}
            onChange={(val) => answerQuestion(currentQuestion.code, val)}
            accentColor={dimension.color}
            allowSkip={role?.allowSkip}
            onBack={handleBack}
            onNext={handleNext}
            nextDisabled={!hasCurrentAnswer}
            nextLabel={
              isLastQuestion
                  ? (isLast ? 'مشاهده نتایج' : 'بُعد بعدی')
                  : 'بعدی'
            }
        />
      </div>
  );
}
