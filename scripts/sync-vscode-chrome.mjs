// Rebase Invariant's non-editor workbench surfaces onto VS Code's Dark 2026 default theme.
//
// A color theme that omits a workbench color does not inherit whichever default
// theme the user has selected: VS Code falls back to the color registry defaults,
// which still carry the Dark+ era values (#007ACC status bar, #333333 activity
// bar). Dark 2026 overrides those in its own theme file, and an extension cannot
// `include` a built-in theme, so the chrome has to be copied in and re-synced
// whenever a VS Code release changes it.
//
// Usage:
//   node scripts/sync-vscode-chrome.mjs [version]   # defaults to latest stable
//
// Writes vscode/invariant-color-theme.json in place and reports what moved.

import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const themeUrl = new URL('vscode/invariant-color-theme.json', root);

// Prefixes Invariant owns outright: the editor surface is the whole point of the theme.
const owned = ['editor', 'terminal', 'diffEditor', 'peekView', 'minimap'];

// Workbench-wide keys Invariant also sets. Dark 2026 wins these because they paint
// chrome — sidebar text, focus rings — rather than anything inside the editor.
const globals = ['foreground', 'focusBorder', 'descriptionForeground', 'errorForeground'];

// The built-in theme files are JSONC: line comments and trailing commas. Scanning
// rather than stripping with a regex, because "$schema" holds a vscode:// URL that
// a naive comment strip would swallow.
const parseJsonc = text => {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      out += char;
      if (char === '\\') out += text[(i += 1)];
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
    } else if (char === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i += 1;
      out += '\n';
    } else if (char === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i += 1;
      i += 1;
    } else {
      out += char;
    }
  }
  // Safe on this input: every string is a hex color, a color key or a schema URL.
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
};

assert.deepEqual(parseJsonc('{"a": 1, /* x */ "b": [2,], // y\n}'), { a: 1, b: [2] });
assert.deepEqual(parseJsonc('{"$schema": "vscode://schemas/color-theme"}'), {
  $schema: 'vscode://schemas/color-theme'
});
assert.deepEqual(parseJsonc('{"a": "quote \\" and // slashes"}'), { a: 'quote " and // slashes' });

const latestStable = async () => {
  const response = await fetch('https://update.code.visualstudio.com/api/update/darwin/stable/latest');
  if (!response.ok) throw new Error(`VS Code update API returned ${response.status}`);
  return (await response.json()).productVersion;
};

const source = (version, file) =>
  `https://raw.githubusercontent.com/microsoft/vscode/${version}/extensions/theme-defaults/themes/${file}`;

// Each built-in theme `include`s the one it extends: 2026-dark -> dark_modern -> dark_vs.
const flatten = async (version, file, seen = new Set()) => {
  if (seen.has(file)) throw new Error(`circular include at ${file}`);
  seen.add(file);
  const response = await fetch(source(version, file));
  if (!response.ok) throw new Error(`${source(version, file)} returned ${response.status}`);
  const theme = parseJsonc(await response.text());
  const inherited = theme.include ? await flatten(version, theme.include.replace(/^\.\//, ''), seen) : {};
  return { ...inherited, ...theme.colors };
};

const version = process.argv[2] ?? (await latestStable());
const defaults = Object.fromEntries(
  Object.entries(await flatten(version, '2026-dark.json')).map(([key, value]) => [key, value.toLowerCase()])
);

const theme = JSON.parse(await readFile(themeUrl, 'utf8'));
const own = theme.colors;
const mine = key => owned.some(prefix => key.startsWith(prefix)) || globals.includes(key);

// Invariant's own colors keep their hand-ordered block; the chrome below is rebuilt
// from scratch every run, so the result depends only on the VS Code version and never
// on what a previous sync happened to leave behind. Hand edits to chrome do not survive.
const colors = {};
for (const [key, value] of Object.entries(own)) {
  if (mine(key)) colors[key] = globals.includes(key) && key in defaults ? defaults[key] : value;
}
for (const key of Object.keys(defaults).sort()) {
  if (!mine(key)) colors[key] = defaults[key];
}

theme.colors = colors;
await writeFile(themeUrl, `${JSON.stringify(theme, null, 2)}\n`);

const added = Object.keys(colors).filter(key => !(key in own));
const removed = Object.keys(own).filter(key => !(key in colors));
const changed = Object.keys(colors).filter(key => key in own && own[key] !== colors[key]);
console.log(`VS Code ${version}: ${Object.keys(defaults).length} default colors read`);
console.log(
  `added ${added.length}, removed ${removed.length}, updated ${changed.length}, total ${Object.keys(colors).length}`
);
for (const key of added) console.log(`  + ${key}: ${colors[key]}`);
for (const key of removed) console.log(`  - ${key}: ${own[key]}`);
for (const key of changed) console.log(`  ~ ${key}: ${own[key]} -> ${colors[key]}`);
