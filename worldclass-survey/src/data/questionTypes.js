// Shared question-type metadata. Questionnaire datasets stay independent;
// only the rendering and authoring contracts are shared.
export const QUESTION_TYPES = {
  singleChoice: {
    label: 'انتخاب یک گزینه',
    answerKind: 'string',
  },
  likert: {
    label: 'لیکرت',
    answerKind: 'number',
  },
  text: {
    label: 'پاسخ متنی',
    answerKind: 'string',
  },
  maturityLevels: {
    label: 'سطوح بلوغ',
    answerKind: 'number-or-skip',
  },
};

export const QUESTION_TYPE_OPTIONS = Object.entries(QUESTION_TYPES).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export function isKnownQuestionType(type) {
  return Boolean(type && QUESTION_TYPES[type]);
}
