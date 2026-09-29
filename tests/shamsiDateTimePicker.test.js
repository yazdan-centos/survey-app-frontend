import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transformWithOxc } from 'vite';

let Picker;

before(async () => {
  const filename = 'src/components/admin/ShamsiDateTimePicker.jsx';
  const source = await readFile(new URL(`../${filename}`, import.meta.url), 'utf8');
  const { code } = await transformWithOxc(source, filename, { jsx: { runtime: 'automatic' } });
  const resolved = code.replace(/from (["'])([^"']+)\1/g, (_, quote, specifier) => {
    // Node requires extensions for these CommonJS package subpaths.
    const path = /^(react-multi-date-picker\/plugins|react-date-object)\//.test(specifier)
      ? `${specifier}.js` : specifier;
    return `from ${quote}${import.meta.resolve(path)}${quote}`;
  });
  ({ default: Picker } = await import(`data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`));
});

test('picker renders an empty date input with the CommonJS component exports', () => {
  const html = renderToStaticMarkup(createElement(Picker, { id: 'start', value: null, onChange() {} }));
  assert.match(html, /<input/);
  assert.match(html, /id="start"/);
});

test('time plugin is a component and clearing the selected date calls onChange', () => {
  let changed = false;
  const element = Picker({ value: new Date(2026, 8, 29, 14, 30), onChange(value) { changed = value; } });
  const [datePicker, clearButton] = element.props.children;
  assert.equal(typeof datePicker.props.plugins[0].type, 'function');
  clearButton.props.onClick();
  assert.equal(changed, null);
  assert.doesNotThrow(() => renderToStaticMarkup(element));
});
