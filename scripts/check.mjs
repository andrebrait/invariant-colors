import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const readJson = async path => JSON.parse(await read(path));
const [manifest, theme, intellij, vim] = await Promise.all([
  readJson('vscode/package.json'),
  readJson('vscode/invariant-color-theme.json'),
  read('jetbrains/invariant.icls'),
  read('colors/invariant.vim')
]);

assert.equal(manifest.contributes.themes[0].path, './invariant-color-theme.json');
assert.match(manifest.description, /theme/i);
assert.equal(manifest.publisher, 'andrebrait');
assert.equal(theme.semanticHighlighting, true);
assert.equal(theme.colors['editor.background'], '#121314');
assert.equal(theme.colors['editorGutter.background'], '#121314');
assert.equal(theme.colors['terminal.background'], '#191a1b');
for (const popup of ['editorWidget.background', 'editorSuggestWidget.background', 'editorHoverWidget.background']) {
  assert.equal(theme.colors[popup], '#202122');
}
assert.equal(theme.semanticTokenColors.method, '#a7ec21');
assert.equal(theme.semanticTokenColors['method.abstract'], '#bed6ff');
assert.notEqual(theme.semanticTokenColors.method, theme.semanticTokenColors['method.abstract']);
assert.equal(theme.semanticTokenColors.variable, theme.semanticTokenColors.property);
assert.equal(theme.semanticTokenColors.parameter, '#79abff');
assert.deepEqual(theme.semanticTokenColors.selfParameter, { foreground: '#ff007f', bold: true });
assert.deepEqual(theme.semanticTokenColors.clsParameter, { foreground: '#ff007f', bold: true });
assert.deepEqual(theme.semanticTokenColors['*.static'], { italic: true });
assert.equal(theme.tokenColors.find(rule => rule.name === 'Comments').settings.foreground, '#ffffff');
assert.deepEqual(theme.tokenColors.find(rule => rule.name === 'Python self and cls').settings, {
  foreground: '#ff007f',
  fontStyle: 'bold'
});
for (const type of ['type', 'class', 'interface', 'struct', 'enum']) {
  assert.equal(theme.semanticTokenColors[type], '#52e3f6');
}
assert.equal(theme.semanticTokenColors.namespace, '#52e3f6');
// Type parameters are deliberately not the type cyan: they name a slot, not a type.
assert.deepEqual(theme.semanticTokenColors.typeParameter, { foreground: '#fd971f', bold: true });
assert.notEqual(theme.semanticTokenColors.typeParameter.foreground, theme.semanticTokenColors.type);
for (const pythonModule of ['namespace:python', 'module:python']) {
  assert.equal(theme.semanticTokenColors[pythonModule], theme.semanticTokenColors.variable);
}

{
  const scheme = intellij;
  assert.match(scheme, /parent_scheme="Islands Dark"/);
  assert.match(scheme, /name="TEXT"[\s\S]*?name="FOREGROUND" value="cfbfad"[\s\S]*?name="BACKGROUND" value="191a1c"/);
  for (const inheritedSurface of ['CONSOLE_BACKGROUND_KEY', 'DOCUMENTATION_COLOR', 'GUTTER_BACKGROUND', 'LOOKUP_COLOR']) {
    assert.doesNotMatch(scheme, new RegExp(`name="${inheritedSurface}"`));
  }
  assert.match(scheme, /Record names and components intentionally inherit class and final-instance-field attributes/);
  assert.doesNotMatch(scheme, /<option name="RECORD_(?:NAME|COMPONENT)_ATTRIBUTES"/);
  assert.match(scheme, /name="ANNOTATION_ATTRIBUTE_NAME_ATTRIBUTES" baseAttributes="DEFAULT_METADATA"/);
  assert.doesNotMatch(scheme, /name="ANNOTATION_NAME_ATTRIBUTES"/);
  // Markdown emphasis and headings carry structure through weight; list markup keeps
  // inheriting so prose never spends a color the code palette needs.
  assert.doesNotMatch(scheme, /name="MARKDOWN_(?:LIST_ITEM|ORDERED_LIST|UNORDERED_LIST)"/);
  assert.match(scheme, /name="MARKDOWN_BOLD">\s*<value>\s*<option name="FONT_TYPE" value="1"\s*\/>/);
  assert.match(scheme, /name="MARKDOWN_ITALIC">\s*<value>\s*<option name="FONT_TYPE" value="2"\s*\/>/);
  for (const level of [1, 2, 3, 4, 5, 6]) {
    assert.match(
      scheme,
      new RegExp(`name="MARKDOWN_HEADER_LEVEL_${level}">\\s*<value>\\s*<option name="FOREGROUND" value="cfbfad"\\s*/>\\s*<option name="FONT_TYPE" value="3"\\s*/>`)
    );
  }
  assert.match(
    scheme,
    /name="TYPE_PARAMETER_NAME_ATTRIBUTES">\s*<value>\s*<option name="FOREGROUND" value="fd971f"\s*\/>\s*<option name="FONT_TYPE" value="1"\s*\/>/
  );
  assert.match(scheme, /name="ABSTRACT_METHOD_ATTRIBUTES"[\s\S]*?value="bed6ff"/);
  assert.match(scheme, /name="DEFAULT_FUNCTION_CALL"[\s\S]*?value="a7ec21"/);
  assert.match(scheme, /name="DEFAULT_FUNCTION_DECLARATION"[\s\S]*?value="a7ec21"/);
  assert.match(scheme, /name="DEFAULT_IDENTIFIER"[\s\S]*?value="cfbfad"/);
  assert.match(scheme, /name="DEFAULT_PARAMETER"[\s\S]*?value="79abff"/);
  // baseAttributes is descriptive, not a directive: the fallback is fixed in IDE source by
  // createTextAttributesKey(name, fallback), and the IDE drops or rewrites whatever a scheme
  // claims. So an entry may only name the fallback the IDE itself declares, and any key whose
  // colour differs from that fallback has to spell the colour out.
  for (const [key, base] of [
    ['DEFAULT_GLOBAL_VARIABLE', 'DEFAULT_IDENTIFIER'],
    ['DEFAULT_INSTANCE_FIELD', 'DEFAULT_IDENTIFIER'],
    ['DEFAULT_INSTANCE_METHOD', 'DEFAULT_FUNCTION_DECLARATION'],
    ['DEFAULT_LABEL', 'DEFAULT_IDENTIFIER'],
    ['DEFAULT_LOCAL_VARIABLE', 'DEFAULT_IDENTIFIER'],
    ['PY.ANNOTATION', 'DEFAULT_IDENTIFIER'],
    ['STATIC_METHOD_ATTRIBUTES', 'DEFAULT_STATIC_METHOD'],
    ['ANNOTATION_ATTRIBUTE_NAME_ATTRIBUTES', 'DEFAULT_METADATA']
  ]) {
    assert.match(scheme, new RegExp(`name="${key}" baseAttributes="${base}"`));
  }
  // Keys whose declared fallback carries the wrong colour, so inheriting would render wrong:
  // DEFAULT_CLASS_REFERENCE and DEFAULT_PREDEFINED_SYMBOL fall back to DEFAULT_IDENTIFIER,
  // PY.SELF_PARAMETER and PY.TYPE_PARAMETER to DEFAULT_PARAMETER, and the Kotlin operator and
  // dynamic-call keys declare no fallback at all.
  for (const [key, value, fontType] of [
    ['DEFAULT_CLASS_REFERENCE', '52e3f6', null],
    ['DEFAULT_PREDEFINED_SYMBOL', 'ff007f', '1'],
    ['PY.SELF_PARAMETER', 'ff007f', '1'],
    ['PY.TYPE_PARAMETER', 'fd971f', '1'],
    ['KOTLIN_COLON', 'ff007f', null],
    ['KOTLIN_QUEST', 'ff007f', null],
    ['KOTLIN_EXCLEXCL', 'ff007f', null],
    ['KOTLIN_DYNAMIC_FUNCTION_CALL', 'a7ec21', null],
    ['KOTLIN_VARIABLE_AS_FUNCTION', 'a7ec21', null],
    ['KOTLIN_VARIABLE_AS_FUNCTION_LIKE', 'a7ec21', null],
    ['KOTLIN_DYNAMIC_PROPERTY_CALL', 'cfbfad', null],
    ['PY.STRING.B', 'ece47e', null]
  ]) {
    const font = fontType ? `\\s*<option name="FONT_TYPE" value="${fontType}"\\s*/>` : '';
    assert.match(
      scheme,
      new RegExp(`name="${key}">\\s*<value>\\s*<option name="FOREGROUND" value="${value}"\\s*/>${font}\\s*</value>`)
    );
    assert.doesNotMatch(scheme, new RegExp(`name="${key}" baseAttributes=`));
  }
  assert.match(scheme, /name="KOTLIN_ARROW">\s*<value>\s*<option name="FOREGROUND" value="cfbfad"\s*\/>\s*<\/value>\s*<\/option>/);
  assert.match(scheme, /name="KOTLIN_FUNCTION_LITERAL_BRACES_AND_ARROW">\s*<value\s*\/>\s*<\/option>/);
  const predefinedUsage = scheme.match(/name="PY\.PREDEFINED_USAGE">[\s\S]*?<value>([\s\S]*?)<\/value>/)[1];
  assert.match(predefinedUsage, /name="FONT_TYPE" value="2"/);
  assert.doesNotMatch(predefinedUsage, /FOREGROUND/);
  for (const comment of ['DEFAULT_BLOCK_COMMENT', 'DEFAULT_DOC_COMMENT', 'DEFAULT_LINE_COMMENT']) {
    assert.match(scheme, new RegExp(`name="${comment}"[\\s\\S]*?value="ffffff"`));
  }
  assert.match(scheme, /name="DEFAULT_STATIC_METHOD"[\s\S]*?name="FONT_TYPE" value="2"/);
  assert.match(scheme, /name="STATIC_METHOD_ATTRIBUTES" baseAttributes="DEFAULT_STATIC_METHOD"/);
  for (const reassigned of ['DEFAULT_REASSIGNED_LOCAL_VARIABLE', 'DEFAULT_REASSIGNED_PARAMETER']) {
    assert.match(scheme, new RegExp(`name="${reassigned}"[\\s\\S]*?name="EFFECT_COLOR" value="b2ada9"[\\s\\S]*?name="EFFECT_TYPE" value="1"`));
  }
  for (const javaOverride of [
    'PARAMETER_ATTRIBUTES',
    'LOCAL_VARIABLE_ATTRIBUTES',
    'INSTANCE_FIELD_ATTRIBUTES',
    'STATIC_FIELD_ATTRIBUTES',
    'METHOD_CALL_ATTRIBUTES',
    'METHOD_DECLARATION_ATTRIBUTES',
    'CLASS_NAME_ATTRIBUTES',
    'INTERFACE_NAME_ATTRIBUTES'
  ]) {
    assert.doesNotMatch(scheme, new RegExp(`name="${javaOverride}"`));
  }
  assert.doesNotMatch(scheme, /name="MISSORTED_IMPORTS_ATTRIBUTES"/);
  assert.match(scheme, /name="IMPLICIT_ANONYMOUS_CLASS_PARAMETER_ATTRIBUTES"[\s\S]*?name="BACKGROUND" value="3c3f41"/);
  const capturedVariable = scheme.match(/name="IMPLICIT_ANONYMOUS_CLASS_PARAMETER_ATTRIBUTES">[\s\S]*?<value>([\s\S]*?)<\/value>/)[1];
  assert.doesNotMatch(capturedVariable, /FOREGROUND/);
}

assert.match(vim, /highlight SM2Signature guifg=#bed6ff/);
assert.match(vim, /highlight Comment\s+guifg=#ffffff/);
assert.match(vim, /highlight Normal\s+guifg=#cfbfad guibg=#191a1c/);
assert.match(vim, /highlight Pmenu\s+guifg=#cfbfad guibg=#27282b/);
assert.match(vim, /highlight! link pythonClassVar Statement/);
assert.match(vim, /@lsp\.mod\.static SM2Static/);
for (const pythonModule of ['@module\\.python', '@module\\.builtin\\.python', '@lsp\\.type\\.namespace\\.python']) {
  assert.match(vim, new RegExp(`link ${pythonModule} Identifier`));
}
console.log('Theme definitions are valid and preserve the semantic color contract.');
