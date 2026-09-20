const LABELS = {
  1: 'سطح ۱ - نوپا',
  2: 'سطح ۲ - در حال توسعه',
  3: 'سطح ۳ - بالغ',
  4: 'سطح ۴ - کلاس جهانی',
  skip: 'بدون اطلاعات کافی',
};

const COLORS = {
  1: '#dc2626',
  2: '#d97706',
  3: '#0284c7',
  4: '#16a34a',
  skip: '#94a3b8',
};

export default function LevelDistribution({ distribution }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const keys = [1, 2, 3, 4, 'skip'].filter((k) => distribution[k] > 0 || k !== 'skip');

  return (
    <div className="space-y-3">
      {keys.map((k) => {
        const count = distribution[k] || 0;
        const percent = Math.round((count / total) * 100);
        return (
          <div key={k}>
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>{LABELS[k]}</span>
              <span>
                {count} پاسخ ({percent}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: COLORS[k] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
