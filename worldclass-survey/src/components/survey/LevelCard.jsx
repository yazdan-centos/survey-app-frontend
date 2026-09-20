const LEVEL_TAGS = ['سطح ۱', 'سطح ۲', 'سطح ۳', 'سطح ۴'];

export default function LevelCard({ levelIndex, text, selected, onSelect, accentColor }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'flex h-full flex-col items-start gap-2 rounded-xl border p-4 text-right text-sm transition-all',
        selected
          ? 'border-transparent bg-slate-900 text-white shadow-md'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
      ].join(' ')}
    >
      <span
        className={[
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
          selected ? 'bg-white/15 text-white' : 'text-white',
        ].join(' ')}
        style={selected ? undefined : { backgroundColor: accentColor }}
      >
        {LEVEL_TAGS[levelIndex - 1]}
      </span>
      <p className="whitespace-pre-line leading-relaxed">{text}</p>
    </button>
  );
}
