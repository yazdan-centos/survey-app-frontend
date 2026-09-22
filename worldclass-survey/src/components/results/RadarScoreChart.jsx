import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function RadarScoreChart({ dimensionScores }) {
  const { isDark } = useTheme();
  const data = dimensionScores.map((d) => ({
    dimension: d.shortLabel,
    امتیاز: d.average,
    fullLabel: d.label,
  }));
  const gridStroke = isDark ? '#334155' : '#e2e8f0';
  const axisTick = isDark ? '#cbd5e1' : '#475569';
  const axisTickMuted = isDark ? '#94a3b8' : '#94a3b8';

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke={gridStroke} />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: axisTick, fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fill: axisTickMuted, fontSize: 10 }} />
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
            contentStyle={{
              direction: 'rtl',
              textAlign: 'right',
              borderRadius: 8,
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              color: isDark ? '#f1f5f9' : '#0f172a',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
