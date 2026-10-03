import React, { useId } from "react";
import styled from "styled-components";
import { uid } from "./guideSchema";

const c = {
  ink: "#1e293b", muted: "#64748b", line: "#cbd5e1", soft: "#f1f5f9",
  brand: "#3730a3", brandDark: "#1e1b4b", danger: "#be123c", dangerBg: "#fff1f2",
  ok: "#0f766e", okBg: "#f0fdfa",
};

// Persian digits for visible counters and screen-reader labels (1 → ۱).
const fa = (n) => n.toLocaleString("fa-IR");

// ── Layout primitives ────────────────────────────────────────────────────────
export const Card = styled.fieldset`
  border: 1px solid ${c.line}; border-radius: 10px; padding: 1.25rem 1.5rem 0.5rem;
  margin: 0 0 1.5rem; min-width: 0;
  legend { font-weight: 700; color: ${c.brand}; padding: 0 0.5rem; }
`;
export const Row = styled.div`
  display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const control = `
  width: 100%; box-sizing: border-box; font: inherit; color: ${c.ink}; background: #fff;
  border: 1px solid ${c.line}; border-radius: 6px; padding: 0.55rem 0.7rem;
  &:focus-visible { outline: 2px solid ${c.brand}; outline-offset: 1px; }
  &[aria-invalid="true"] { border-color: ${c.danger}; }
  &:disabled { background: ${c.soft}; }
`;
const Input = styled.input`${control}`;
const Area = styled.textarea`${control} min-height: 5.5rem; resize: vertical; line-height: 1.7;`;
const Pick = styled.select`${control}`;

const FieldWrap = styled.div`margin-bottom: 1.1rem;`;
const Label = styled.label`display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.3rem; color: ${c.ink};`;
const Hint = styled.p`margin: 0.25rem 0 0; font-size: 0.78rem; color: ${c.muted};`;
const ErrorText = styled.p`margin: 0.3rem 0 0; font-size: 0.8rem; color: ${c.danger};`;

// ── Buttons & alerts ─────────────────────────────────────────────────────────
export const Button = styled.button`
  font: inherit; font-weight: 600; font-size: 0.88rem; cursor: pointer; border-radius: 6px;
  padding: 0.55rem 1.1rem; border: 1px solid ${({ $primary }) => ($primary ? c.brand : c.line)};
  background: ${({ $primary }) => ($primary ? c.brand : "#fff")};
  color: ${({ $primary }) => ($primary ? "#fff" : c.ink)};
  &:hover:not(:disabled) { background: ${({ $primary }) => ($primary ? c.brandDark : c.soft)}; }
  &:focus-visible { outline: 2px solid ${c.brand}; outline-offset: 2px; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const LinkButton = styled(Button)`border: 0; background: transparent; color: ${c.brand}; padding: 0.3rem 0.4rem;`;
const DangerButton = styled(LinkButton)`color: ${c.danger};`;

export const Alert = styled.div.attrs(({ $tone }) => ({ role: $tone === "error" ? "alert" : "status" }))`
  border-radius: 8px; padding: 0.85rem 1.1rem; margin-bottom: 1.25rem; font-size: 0.9rem;
  border: 1px solid ${({ $tone }) => ($tone === "error" ? c.danger : c.ok)};
  background: ${({ $tone }) => ($tone === "error" ? c.dangerBg : c.okBg)};
  color: ${({ $tone }) => ($tone === "error" ? c.danger : c.ok)};
`;

// ── Field components ─────────────────────────────────────────────────────────
/** Wires label, hint and error to the control for screen readers. */
function Field({ label, hint, error, required, children }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
      <FieldWrap>
        {label && <Label htmlFor={id}>{label}{required && <span aria-hidden> *</span>}</Label>}
        {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? "true" : undefined, "aria-required": required || undefined })}
        {hint && <Hint id={`${id}-hint`}>{hint}</Hint>}
        {error && <ErrorText id={`${id}-err`}>{error}</ErrorText>}
      </FieldWrap>
  );
}

export const TextField = ({ label, hint, error, required, rtl, multiline, ...props }) => (
    <Field {...{ label, hint, error, required }}>
      {(a11y) => multiline
          ? <Area dir={rtl ? "rtl" : undefined} {...a11y} {...props} />
          : <Input dir={rtl ? "rtl" : undefined} {...a11y} {...props} />}
    </Field>
);

export const SelectField = ({ label, hint, error, required, options, placeholder, ...props }) => (
    <Field {...{ label, hint, error, required }}>
      {(a11y) => (
          <Pick {...a11y} {...props}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Pick>
      )}
    </Field>
);

/** Editable list of strings, stored as [{ id, value }] so React keys stay stable. */
export function ListField({ label, hint, error, required, items, onChange, multiline, rtl, addLabel = "افزودن", itemLabel = "مورد", disabled }) {
  const update = (id, value) => onChange(items.map((i) => (i.id === id ? { ...i, value } : i)));
  const remove = (id) => onChange(items.filter((i) => i.id !== id));
  const move = (idx, dir) => {
    const next = [...items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  return (
      <FieldWrap role="group" aria-label={label}>
        <Label as="span">{label}{required && <span aria-hidden> *</span>}</Label>
        {items.map((it, idx) => (
            <div key={it.id} style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                {multiline
                    ? <Area dir={rtl ? "rtl" : undefined} aria-label={`${itemLabel} ${fa(idx + 1)}`} aria-invalid={error ? "true" : undefined} value={it.value} disabled={disabled} onChange={(e) => update(it.id, e.target.value)} />
                    : <Input dir={rtl ? "rtl" : undefined} aria-label={`${itemLabel} ${fa(idx + 1)}`} aria-invalid={error ? "true" : undefined} value={it.value} disabled={disabled} onChange={(e) => update(it.id, e.target.value)} />}
              </div>
              <LinkButton type="button" disabled={disabled || idx === 0} onClick={() => move(idx, -1)} aria-label={`انتقال ${itemLabel} ${fa(idx + 1)} به بالا`}>↑</LinkButton>
              <LinkButton type="button" disabled={disabled || idx === items.length - 1} onClick={() => move(idx, 1)} aria-label={`انتقال ${itemLabel} ${fa(idx + 1)} به پایین`}>↓</LinkButton>
              <DangerButton type="button" disabled={disabled} onClick={() => remove(it.id)} aria-label={`حذف ${itemLabel} ${fa(idx + 1)}`}>حذف</DangerButton>
            </div>
        ))}
        <LinkButton type="button" disabled={disabled} onClick={() => onChange([...items, { id: uid(), value: "" }])}>+ {addLabel}</LinkButton>
        {hint && <Hint>{hint}</Hint>}
        {error && <ErrorText>{error}</ErrorText>}
      </FieldWrap>
  );
}

const Block = styled.div`border: 1px solid ${c.line}; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: ${c.soft};`;
const BlockHead = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; font-weight: 600; font-size: 0.85rem;`;

/** Sections: each has a title and its own list of paragraphs. */
export function SectionsField({ sections, onChange, errors, disabled }) {
  const patch = (id, changes) => onChange(sections.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  return (
      <div>
        {errors.sections && <ErrorText>{errors.sections}</ErrorText>}
        {sections.map((s, i) => (
            <Block key={s.id}>
              <BlockHead>
                بخش {fa(i + 1)}
                <DangerButton type="button" disabled={disabled} onClick={() => onChange(sections.filter((x) => x.id !== s.id))}>حذف بخش</DangerButton>
              </BlockHead>
              <TextField label="عنوان بخش" required rtl value={s.title} disabled={disabled}
                         error={errors[`sections.${i}.title`]} onChange={(e) => patch(s.id, { title: e.target.value })} />
              <ListField label="پاراگراف‌ها" required rtl multiline itemLabel="پاراگراف" addLabel="افزودن پاراگراف" disabled={disabled}
                         items={s.paragraphs} error={errors[`sections.${i}.paragraphs`]} onChange={(paragraphs) => patch(s.id, { paragraphs })} />
            </Block>
        ))}
        <Button type="button" disabled={disabled} onClick={() => onChange([...sections, { id: uid(), title: "", paragraphs: [{ id: uid(), value: "" }] }])}>+ افزودن بخش</Button>
      </div>
  );
}

/** Optional timeline, used by the manager guide. */
export function TimelineField({ items, onChange, errors, disabled }) {
  const patch = (id, changes) => onChange(items.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  return (
      <div>
        {errors.timeline && <ErrorText>{errors.timeline}</ErrorText>}
        {items.map((t, i) => (
            <Block key={t.id}>
              <BlockHead>
                نقطهٔ عطف {fa(i + 1)}
                <DangerButton type="button" disabled={disabled} onClick={() => onChange(items.filter((x) => x.id !== t.id))}>حذف</DangerButton>
              </BlockHead>
              <Row>
                <TextField label="سال یا عنوان کوتاه" required rtl value={t.year ?? ""} disabled={disabled} error={errors[`timeline.${i}.year`]} onChange={(e) => patch(t.id, { year: e.target.value })} />
                <TextField label="توضیح" required rtl value={t.label ?? ""} disabled={disabled} error={errors[`timeline.${i}.label`]} onChange={(e) => patch(t.id, { label: e.target.value })} />
              </Row>
              <label style={{ fontSize: "0.85rem" }}>
                <input type="checkbox" checked={!!t.active} disabled={disabled} onChange={(e) => onChange(items.map((x) => ({ ...x, active: x.id === t.id ? e.target.checked : false })))} /> برجسته شود (مورد فعلی)
              </label>
            </Block>
        ))}
        <Button type="button" disabled={disabled} onClick={() => onChange([...items, { id: uid(), year: "", label: "", active: false }])}>+ افزودن نقطهٔ عطف</Button>
      </div>
  );
}