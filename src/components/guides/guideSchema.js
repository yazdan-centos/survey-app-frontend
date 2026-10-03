// Form model, API <-> form mapping, and validation. No React in here, so it is easy to unit test.
// User-facing strings (option labels and validation messages) are in Persian.

export const SEVERITY_LEVELS = [
  { value: "info", label: "اطلاعاتی" },
  { value: "low", label: "کم" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "بالا" },
];

export const AUDIENCES = [
  { value: "board", label: "هیئت‌مدیره" },
  { value: "manager", label: "مدیران و معاونان" },
  { value: "stakeholder", label: "مشتریان و تأمین‌کنندگان" },
];

export const THEMES = [
  { value: "indigo", label: "نیلی + طلایی" },
  { value: "navy", label: "سرمه‌ای + بنفش" },
  { value: "teal", label: "فیروزه‌ای + کهربایی" },
];

let counter = 0;
export const uid = () => `k${Date.now().toString(36)}${counter++}`;
const item = (value = "") => ({ id: uid(), value });
const toItems = (arr = []) => arr.map(item);
const fromItems = (arr) => arr.map((i) => i.value.trim()).filter(Boolean);

export const emptyGuide = () => ({
  audience: "",
  theme: "indigo",
  status: "draft",
  severity: "info",
  surveyId: "",
  roleTags: [item()],
  title: "",
  subtitle: "",
  content: "",
  footer: "",
  startButtonLabel: "",
});

export function toFormValues(g) {
  return {
    ...emptyGuide(),
    audience: g.audience ?? "",
    theme: g.theme ?? "indigo",
    status: g.status ?? "draft",
    severity: g.severity ?? "info",
    surveyId: g.surveyId ?? "",
    roleTags: toItems(g.roleTags),
    title: g.title ?? "",
    subtitle: g.subtitle ?? "",
    content: g.content ?? "",
    footer: g.footer ?? "",
    startButtonLabel: g.startButtonLabel ?? "",
  };
}

export function toPayload(v) {
  return {
    audience: v.audience,
    theme: v.theme,
    status: v.status,
    severity: v.severity,
    surveyId: v.surveyId,
    roleTags: fromItems(v.roleTags),
    title: v.title.trim(),
    subtitle: v.subtitle.trim(),
    content: v.content.trim(),
    footer: v.footer.trim(),
    startButtonLabel: v.startButtonLabel.trim(),
  };
}

const blank = (s) => !s || !s.trim();
const hasContent = (list) => list.some((i) => !blank(i.value));

/** Returns a flat map of { "path.to.field": "message" }. Empty object = valid. */
export function validateGuide(v) {
  const e = {};
  if (!v.audience) e.audience = "مخاطب این راهنما را انتخاب کنید.";
  if (!v.theme) e.theme = "یک پوسته انتخاب کنید.";
  if (!v.severity) e.severity = "سطح اهمیت را انتخاب کنید.";
  if (!v.surveyId) e.surveyId = "پیمایش مرتبط را انتخاب کنید.";
  if (!hasContent(v.roleTags)) e.roleTags = "دست‌کم یک برچسب مخاطب اضافه کنید.";
  if (blank(v.title)) e.title = "عنوان را وارد کنید.";
  else if (v.title.trim().length > 120) e.title = "عنوان نباید بیشتر از ۱۲۰ نویسه باشد.";
  if (blank(v.subtitle)) e.subtitle = "زیرعنوان را وارد کنید.";
  if (blank(v.content)) e.content = "محتوای راهنما را وارد کنید.";
  if (blank(v.footer)) e.footer = "متن پابرگ را وارد کنید.";
  return e;
}
