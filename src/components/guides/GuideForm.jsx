import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { ApiError, guideApi } from "./guideApi";
import { AUDIENCES, THEMES, SEVERITY_LEVELS, emptyGuide, toFormValues, toPayload, validateGuide } from "./guideSchema";
import { useGuide } from "./useGuide";
import { useHttp } from '../../hooks/useHttp';
import { listSurveys } from '../../services/adminSurveyService';
import { Alert, Button, Card, ListField, Row, SelectField, TextField } from "./fields";

// ── Persian (fa-IR) UI strings ───────────────────────────────────────────────
const FA = {
  loading: "در حال بارگذاری راهنما…",
  retry: "تلاش دوباره",
  back: "بازگشت",
  titleEdit: "ویرایش راهنما",
  titleNew: "راهنمای جدید",

  fixErrors: "فیلدهای مشخص‌شده را اصلاح کنید و دوباره ذخیره کنید.",
  genericError: "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
  updated: "راهنما به‌روزرسانی شد.",
  created: "راهنما ایجاد شد.",
  discardConfirm: "تغییرات ذخیره‌نشده از بین می‌رود. ادامه می‌دهید؟",

  sections: {
    basic: "اطلاعات پایه",
    content: "محتوا",
    tags: "برچسب‌ها",
  },

  fields: {
    survey: "پیمایش",
    surveyPlaceholder: "انتخاب کنید…",
    audience: "مخاطب",
    audiencePlaceholder: "انتخاب کنید…",
    theme: "پوسته",
    severity: "سطح اهمیت",
    status: "وضعیت",
    statusDraft: "پیش‌نویس",
    statusPublished: "منتشرشده",

    roleTags: "برچسب‌های مخاطب",
    roleTagsItem: "برچسب",
    roleTagsAdd: "افزودن برچسب",
    roleTagsHint: "به‌صورت برچسب در سربرگ نمایش داده می‌شود؛ مثلاً مشتریان، تأمین‌کنندگان.",

    title: "عنوان",
    subtitle: "زیرعنوان",
    content: "محتوا",
    contentHint: "محتوای اصلی راهنما. فاصله‌های خطی حفظ می‌شوند.",
    footer: "متن پابرگ",
    startButtonLabel: "عنوان دکمه شروع",
    startButtonHint: "برای پنهان کردن دکمه، خالی بگذارید.",
  },

  actions: {
    cancel: "انصراف",
    saving: "در حال ذخیره…",
    saveChanges: "ذخیره تغییرات",
    create: "ایجاد راهنما",
  },
};

const Page = styled.div`max-width: 820px; margin: 0 auto; padding: 2rem 1.25rem 4rem; font-family: "Vazirmatn", "IRANSans", system-ui, sans-serif;`;
const Actions = styled.div`
  position: sticky; bottom: 0; display: flex; gap: 0.75rem; justify-content: flex-end;
  padding: 0.9rem 0; background: linear-gradient(transparent, #fff 30%);
`;

/**
 * Create / edit form for guides (Persian, right-to-left UI).
 * @param {string}   [guideId]  Present = edit mode; absent = create mode.
 * @param {Function} [onSaved]  Called with the saved guide (e.g. navigate to its page).
 * @param {Function} [onCancel] Called when the user leaves without saving.
 */
export default function GuideForm({ guideId, onSaved, onCancel }) {
  const http = useHttp();
  const isEdit = Boolean(guideId);
  const { guide, loading, error: loadError, retry } = useGuide(guideId);

  const [surveys, setSurveys] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [values, setValues] = useState(emptyGuide);
  const [baseline, setBaseline] = useState(() => JSON.stringify(toPayload(values)));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null); // { tone: "success" | "error", text }
  const formRef = useRef(null);

  // Load surveys for the dropdown
  useEffect(() => {
    let isMounted = true;
    const loadSurveys = async () => {
      try {
        const data = await listSurveys(http, {});
        if (isMounted) {
          setSurveys(data);
          setLoadingSurveys(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load surveys:', err);
          setLoadingSurveys(false);
        }
      }
    };
    loadSurveys();
    return () => { isMounted = false; };
  }, [http]);

  // Hydrate the form when an existing guide arrives.
  useEffect(() => {
    if (!guide) return;
    const next = toFormValues(guide);
    setValues(next);
    setBaseline(JSON.stringify(toPayload(next)));
  }, [guide]);

  // Warn before losing unsaved changes (the browser shows its own localized text).
  const dirty = useMemo(() => JSON.stringify(toPayload(values)) !== baseline, [values, baseline]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (key) => (val) => setValues((v) => ({ ...v, [key]: val }));
  const bind = (key) => ({
    value: values[key],
    onChange: (e) => set(key)(e.target.value),
    error: errors[key],
    disabled: saving,
  });

  const focusFirstError = () => {
    const firstErr = formRef.current?.querySelector('[aria-invalid="true"]');
    firstErr?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const clientErrors = validateGuide(values);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setBanner({ tone: "error", text: FA.fixErrors });
      focusFirstError();
      return;
    }
    setErrors({});
    setBanner(null);
    setSaving(true);

    try {
      const payload = toPayload(values);
      const saved = isEdit
          ? await guideApi.update(http, guideId, payload)
          : await guideApi.create(http, payload);
      setBaseline(JSON.stringify(payload));
      setBanner({ tone: "success", text: isEdit ? FA.updated : FA.created });
      onSaved?.(saved);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError(FA.genericError, err.status, {});
      setErrors((prev) => ({ ...prev, ...apiErr.fieldErrors }));
      setBanner({ tone: "error", text: apiErr.message });
      if (Object.keys(apiErr.fieldErrors).length) focusFirstError();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (dirty && !window.confirm(FA.discardConfirm)) return;
    onCancel?.();
  };

  const surveyOptions = surveys.map((s) => ({
    value: s.id,
    label: ` ()`
  }));

  // ── Load states (edit mode) ────────────────────────────────────────────────
  if (loading || loadingSurveys) return <Page dir="rtl" lang="fa" role="status" aria-busy="true">{FA.loading}</Page>;
  if (loadError) {
    return (
        <Page dir="rtl" lang="fa">
          <Alert $tone="error">{loadError.message}</Alert>
          {loadError.status !== 404 && <Button onClick={retry}>{FA.retry}</Button>}
          {onCancel && <Button onClick={onCancel} style={{ marginInlineStart: "0.5rem" }}>{FA.back}</Button>}
        </Page>
    );
  }

  return (
      <Page dir="rtl" lang="fa">
        <h1>{isEdit ? FA.titleEdit : FA.titleNew}</h1>
        {banner && <Alert $tone={banner.tone}>{banner.text}</Alert>}

        <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={saving}>
          <Card disabled={saving}>
            <legend>{FA.sections.basic}</legend>
            <SelectField label={FA.fields.survey} required placeholder={FA.fields.surveyPlaceholder} options={surveyOptions} {...bind("surveyId")} />
            <TextField label={FA.fields.title} required rtl {...bind("title")} />
            <TextField label={FA.fields.subtitle} required rtl {...bind("subtitle")} />
            <Row>
              <SelectField label={FA.fields.audience} required placeholder={FA.fields.audiencePlaceholder} options={AUDIENCES} {...bind("audience")} />
              <SelectField label={FA.fields.theme} required options={THEMES} {...bind("theme")} />
              <SelectField label={FA.fields.severity} required options={SEVERITY_LEVELS} {...bind("severity")} />
              <SelectField
                  label={FA.fields.status}
                  options={[
                    { value: "draft", label: FA.fields.statusDraft },
                    { value: "published", label: FA.fields.statusPublished },
                  ]}
                  {...bind("status")}
              />
            </Row>
            <TextField label={FA.fields.startButtonLabel} rtl hint={FA.fields.startButtonHint} {...bind("startButtonLabel")} />
            <TextField label={FA.fields.footer} required rtl {...bind("footer")} />
          </Card>

          <Card disabled={saving}>
            <legend>{FA.sections.content}</legend>
            <TextField label={FA.fields.content} required rtl multiline hint={FA.fields.contentHint} {...bind("content")} />
          </Card>

          <Card disabled={saving}>
            <legend>{FA.sections.tags}</legend>
            <ListField label={FA.fields.roleTags} required rtl itemLabel={FA.fields.roleTagsItem} addLabel={FA.fields.roleTagsAdd}
                       hint={FA.fields.roleTagsHint}
                       items={values.roleTags} onChange={set("roleTags")} error={errors.roleTags} disabled={saving} />
          </Card>

          <Actions>
            {onCancel && <Button type="button" onClick={handleCancel} disabled={saving}>{FA.actions.cancel}</Button>}
            <Button type="submit" $primary disabled={saving || (isEdit && !dirty)}>
              {saving ? FA.actions.saving : isEdit ? FA.actions.saveChanges : FA.actions.create}
            </Button>
          </Actions>
        </form>
      </Page>
  );
}
