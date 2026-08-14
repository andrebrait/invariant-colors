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
  assert.doesNotMatch(scheme, /name="MARKDOWN_(?:BOLD|ITALIC|LIST_ITEM|ORDERED_LIST|UNORDERED_LIST)"/);
  assert.match(scheme, /name="ABSTRACT_METHOD_ATTRIBUTES"[\s\S]*?value="bed6ff"/);
  assert.match(scheme, /name="DEFAULT_FUNCTION_CALL"[\s\S]*?value="a7ec21"/);
  assert.match(scheme, /name="DEFAULT_FUNCTION_DECLARATION"[\s\S]*?value="a7ec21"/);
  assert.match(scheme, /name="DEFAULT_IDENTIFIER"[\s\S]*?value="cfbfad"/);
  assert.match(scheme, /name="DEFAULT_INSTANCE_FIELD" baseAttributes="DEFAULT_IDENTIFIER"/);
  assert.match(scheme, /name="DEFAULT_PARAMETER"[\s\S]*?value="79abff"/);
  for (const [key, base] of [
    ['CSS.IDENT', 'DEFAULT_TAG'],
    ['DEFAULT_CLASS_REFERENCE', 'DEFAULT_CLASS_NAME'],
    ['DEFAULT_GLOBAL_VARIABLE', 'DEFAULT_IDENTIFIER'],
    ['DEFAULT_INSTANCE_METHOD', 'DEFAULT_FUNCTION_DECLARATION'],
    ['DEFAULT_LABEL', 'DEFAULT_IDENTIFIER'],
    ['DEFAULT_LOCAL_VARIABLE', 'DEFAULT_IDENTIFIER'],
    ['DEFAULT_PREDEFINED_SYMBOL', 'DEFAULT_KEYWORD'],
    ['KOTLIN_COLON', 'DEFAULT_OPERATION_SIGN'],
    ['KOTLIN_ARROW', 'DEFAULT_IDENTIFIER'],
    ['KOTLIN_DYNAMIC_FUNCTION_CALL', 'DEFAULT_FUNCTION_CALL'],
    ['KOTLIN_DYNAMIC_PROPERTY_CALL', 'DEFAULT_INSTANCE_FIELD'],
    ['KOTLIN_EXCLEXCL', 'DEFAULT_OPERATION_SIGN'],
    ['KOTLIN_QUEST', 'DEFAULT_OPERATION_SIGN'],
    ['KOTLIN_VARIABLE_AS_FUNCTION', 'DEFAULT_FUNCTION_CALL'],
    ['KOTLIN_VARIABLE_AS_FUNCTION_LIKE', 'DEFAULT_FUNCTION_CALL'],
    ['PY.SELF_PARAMETER', 'DEFAULT_KEYWORD'],
    ['PY.ANNOTATION', 'DEFAULT_CLASS_REFERENCE'],
    ['PY.TYPE_PARAMETER', 'TYPE_PARAMETER_NAME_ATTRIBUTES']
  ]) {
    assert.match(scheme, new RegExp(`name="${key}" baseAttributes="${base}"`));
  }
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
console.log('Theme definitions are valid and preserve the semantic color contract.');
