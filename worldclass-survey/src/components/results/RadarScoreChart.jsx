import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function RadarScoreChart({ dimensionScores }) {
  const data = dimensionScores.map((d) => ({
    dimension: d.shortLabel,
    امتیاز: d.average,
    fullLabel: d.label,
  }));

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Radar
            name="میانگین امتیاز"
            dataKey="امتیاز"
            stroke="#0f766e"
            fill="#0f766e"
            fillOpacity={0.35}
          />
          <Tooltip
            formatter={(val) => [`${val} از ۴`, 'میانگین امتیاز']}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel ?? label}
            contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: 8 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
