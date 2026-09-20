// Respondent role/profile definitions.
// Each role maps to a question bank (surveyQuestions.json) and a demographic form (demographics.json).
export const ROLES = [
  {
    id: 'managers',
    label: 'معاونین و مدیران',
    description: 'مدیران ارشد، معاونین و مدیران میانی شرکت',
    demoKey: 'managers',
    allowSkip: false,
  },
  {
    id: 'board',
    label: 'اعضای هیأت مدیره',
    description: 'اعضای هیأت مدیره و نهادهای بالادستی',
    demoKey: 'board',
    allowSkip: true,
  },
  {
    id: 'customers',
    label: 'مشتریان کلیدی',
    description: 'مشتریان و ذی‌نفعان کلیدی شرکت',
    demoKey: 'stakeholders',
    allowSkip: true,
  },
  {
    id: 'suppliers',
    label: 'پیمانکاران و تأمین‌کنندگان',
    description: 'شرکای تجاری، پیمانکاران و تأمین‌کنندگان',
    demoKey: 'stakeholders',
    allowSkip: true,
  },
];

export const getRoleById = (id) => ROLES.find((r) => r.id === id);
