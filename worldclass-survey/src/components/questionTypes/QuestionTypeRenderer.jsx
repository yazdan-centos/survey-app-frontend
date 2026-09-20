import LevelCard from '../survey/LevelCard';

function LikertInput({ question, value, onChange }) {
  const labels = question.labels || ['۱', '۲', '۳', '۴', '۵'];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label={question.criterion || question.prompt}>
      {labels.map((label, index) => {
        const score = index + 1;
        const selected = value === score;
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(score)}
            className={`rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-colors ${selected ? 'border-primary-800 bg-primary-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-primary-300 hover:bg-primary-50'}`}
          >
            <span className="block text-lg">{score}</span>
            <span className="mt-1 block text-xs">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function QuestionTypeRenderer({ type, question, value, onChange, accentColor }) {
  if (type === 'likert') return <LikertInput question={question} value={value} onChange={onChange} />;
  if (type === 'maturityLevels') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(question.levels || []).map((text, index) => (
          <LevelCard key={index} levelIndex={index + 1} text={text} selected={value === index + 1} onSelect={() => onChange(index + 1)} accentColor={accentColor} />
        ))}
      </div>
    );
  }
  if (type === 'text') {
    return <textarea value={value || ''} onChange={(event) => onChange(event.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />;
  }
  return null;
}
