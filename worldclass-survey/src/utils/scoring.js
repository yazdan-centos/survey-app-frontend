// Maps an average score (0-4) to a qualitative performance label.
export function scoreToLevelLabel(average) {
  if (average <= 0) return 'بدون داده';
  if (average < 1.75) return 'سطح ۱ - نوپا';
  if (average < 2.5) return 'سطح ۲ - در حال توسعه';
  if (average < 3.25) return 'سطح ۳ - بالغ';
  return 'سطح ۴ - کلاس جهانی';
}

export function scoreToPercent(average) {
  return Math.round((average / 4) * 100);
}
