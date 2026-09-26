import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { responseNumber } from '../../utils/responseDisplay';

const panelClass = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900';

export default function ReportCharts({ report }) {
  const { isDark, primary } = useTheme();
  const distribution = [
    { name: 'پاسخ‌های دارای سطح', value: report.answeredCount, fill: primary[700] },
    { name: 'بدون اطلاعات کافی', value: report.skippedCount, fill: '#94a3b8' },
  ];
  const tooltipStyle = {
    direction: 'rtl',
    textAlign: 'right',
    borderRadius: 8,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f1f5f9' : '#0f172a',
  };
  const tick = { fill: isDark ? '#cbd5e1' : '#475569', fontSize: 12 };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={panelClass} aria-labelledby="report-audience-chart">
        <h3 id="report-audience-chart" className="font-semibold">پاسخ‌نامه‌ها به تفکیک گروه</h3>
        {report.audiences.some((audience) => audience.responseCount > 0) ? (
          <div className="mt-4 h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.audiences} layout="vertical" margin={{ left: 16, right: 24 }} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis type="number" allowDecimals={false} tick={tick} tickFormatter={responseNumber} />
                <YAxis type="category" dataKey="label" width={110} tick={tick} />
                <Tooltip formatter={responseNumber} contentStyle={tooltipStyle} />
                <Bar dataKey="responseCount" name="پاسخ‌نامه‌ها" fill={primary[700]} radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">آمار گروه‌های پاسخ‌دهنده موجود نیست.</p>}
      </section>
      <section className={panelClass} aria-labelledby="report-answer-chart">
        <h3 id="report-answer-chart" className="font-semibold">وضعیت پاسخ به سؤال‌ها</h3>
        {report.answeredCount + report.skippedCount > 0 ? (
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                  {distribution.map((item) => <Cell key={item.name} fill={item.fill} />)}
                </Pie>
                <Tooltip formatter={responseNumber} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">هنوز پاسخی به سؤال‌ها ثبت نشده است.</p>}
        <ul className="space-y-2 text-sm">
          {distribution.map((item) => <li key={item.name} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />{item.name}</span><span>{responseNumber(item.value)}</span></li>)}
        </ul>
      </section>
    </div>
  );
}
