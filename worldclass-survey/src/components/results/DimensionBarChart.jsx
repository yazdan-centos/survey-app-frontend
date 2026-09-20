import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function DimensionBarChart({ dimensionScores }) {
  const data = dimensionScores.map((d) => ({
    dimension: d.shortLabel,
    fullLabel: d.label,
    امتیاز: d.average,
    color: d.color,
  }));

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip
            formatter={(val) => [`${val} از ۴`, 'میانگین امتیاز']}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel ?? label}
            contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: 8 }}
          />
          <Bar dataKey="امتیاز" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
