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
const functionScopes = theme.tokenColors.find(rule => rule.name === 'Functions and methods').scope;
assert.ok(!functionScopes.includes('meta.function-call'));
assert.ok(functionScopes.includes('meta.function-call.generic.python'));
assert.equal(theme.semanticTokenColors.variable, theme.semanticTokenColors.property);
const propertyRule = theme.tokenColors.find(rule => rule.name === 'Variables and properties');
assert.equal(propertyRule.settings.foreground, theme.semanticTokenColors.property);
for (const scope of [
  'support.type.property-name.json',
  'support.type.property-name.json.comments',
  'support.type.property-name.json.lines'
]) {
  assert.ok(propertyRule.scope.includes(scope));
}
assert.equal(theme.semanticTokenColors.parameter, '#79abff');
assert.deepEqual(theme.semanticTokenColors.selfParameter, { foreground: '#ff007f', bold: true });
assert.deepEqual(theme.semanticTokenColors.clsParameter, { foreground: '#ff007f', bold: true });
assert.deepEqual(theme.semanticTokenColors['*.modification'], { underline: true });
assert.deepEqual(theme.semanticTokenColors['*.static'], { italic: true });
assert.ok(!Object.hasOwn(theme.semanticTokenColors, '*.readonly'));
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
  // A bundledColorScheme may only name a parent that is certain to be registered when the
  // IDE loads it. DefaultColorSchemesManager ships exactly Default and Darcula; every other
  // scheme is contributed by a plugin and can be missing, and AbstractColorsScheme.resolveParent
  // then throws InvalidDataException and the IDE drops the whole scheme. "Islands Dark" is such
  // a scheme and is absent on a non-Islands UI, which kept this plugin from ever appearing.
  // Islands Dark is itself Darcula plus overrides, so those overrides are spelled out here.
  assert.match(scheme, /parent_scheme="Darcula"/);
  assert.doesNotMatch(scheme, /parent_scheme="Islands Dark"/);
  assert.match(scheme, /name="TEXT"[\s\S]*?name="FOREGROUND" value="cfbfad"[\s\S]*?name="BACKGROUND" value="191a1c"/);
  for (const [surface, colour] of [
    ['CONSOLE_BACKGROUND_KEY', '191a1c'],
    ['DOCUMENTATION_COLOR', '27282b'],
    ['LOOKUP_COLOR', '27282b']
  ]) {
    assert.match(scheme, new RegExp(`<option name="${surface}" value="${colour}" />`));
  }
  // An empty value is how Islands Dark makes the gutter follow the editor background.
  assert.match(scheme, /<option name="EDITOR_GUTTER_BACKGROUND" value="" \/>/);
  assert.match(scheme, /Record names and components intentionally inherit class and final-instance-field attributes/);
  assert.doesNotMatch(scheme, /<option name="RECORD_(?:NAME|COMPONENT)_ATTRIBUTES"/);
  assert.match(scheme, /name="ANNOTATION_ATTRIBUTE_NAME_ATTRIBUTES" baseAttributes="DEFAULT_METADATA"/);
  // Islands Dark reset this key to its fallback rather than leaving it at the Darcula value.
  // Under a Darcula parent the reset has to be spelled out to keep the same rendering.
  assert.match(scheme, /name="ANNOTATION_NAME_ATTRIBUTES" baseAttributes="DEFAULT_METADATA"/);
  // Markdown emphasis carries structure through weight; headings use function green.
  assert.doesNotMatch(scheme, /name="MARKDOWN_(?:LIST_ITEM|ORDERED_LIST|UNORDERED_LIST)"/);
  assert.match(scheme, /name="MARKDOWN_BOLD">\s*<value>\s*<option name="FONT_TYPE" value="1"\s*\/>/);
  assert.match(scheme, /name="MARKDOWN_ITALIC">\s*<value>\s*<option name="FONT_TYPE" value="2"\s*\/>/);
  assert.match(scheme, /name="MARKDOWN_HEADER_MARKER">\s*<value>\s*<option name="FOREGROUND" value="a7ec21"\s*\/>/);
  assert.match(scheme, /name="MARKDOWN_LINK_LABEL">\s*<value>\s*<option name="FOREGROUND" value="ff007f"\s*\/>/);
  for (const level of [1, 2, 3, 4, 5, 6]) {
    assert.match(
      scheme,
      new RegExp(`name="MARKDOWN_HEADER_LEVEL_${level}">\\s*<value>\\s*<option name="FOREGROUND" value="a7ec21"\\s*/>\\s*<option name="FONT_TYPE" value="3"\\s*/>`)
    );
  }
  // Markdown links keep the link colour and an underline; destinations read as parameters.
  for (const [link, colour] of [
    ['MARKDOWN_LINK_TEXT', '52e3f6'],
    ['MARKDOWN_LINK_DESTINATION', '79abff'],
    ['MARKDOWN_AUTO_LINK', '79abff']
  ]) {
    assert.match(
      scheme,
      new RegExp(`name="${link}">\\s*<value>\\s*<option name="FOREGROUND" value="${colour}"\\s*/>\\s*<option name="EFFECT_COLOR" value="${colour}"\\s*/>\\s*<option name="EFFECT_TYPE" value="1"\\s*/>`)
    );
  }
  // Markup: tags and attributes reset to their declared fallbacks, entities and custom tags are pinned.
  for (const [key, base] of [
    ['HTML_TAG', 'DEFAULT_TAG'],
    ['XML_TAG', 'DEFAULT_TAG'],
    ['HTML_TAG_NAME', 'DEFAULT_KEYWORD'],
    ['XML_TAG_NAME', 'DEFAULT_KEYWORD'],
    ['HTML_ATTRIBUTE_NAME', 'DEFAULT_ATTRIBUTE'],
    ['XML_ATTRIBUTE_NAME', 'DEFAULT_ATTRIBUTE']
  ]) {
    assert.match(scheme, new RegExp(`name="${key}" baseAttributes="${base}"`));
  }
  for (const entity of ['HTML_ENTITY_REFERENCE', 'XML_ENTITY_REFERENCE', 'YAML_ANCHOR']) {
    assert.match(scheme, new RegExp(`name="${entity}">\\s*<value>\\s*<option name="FOREGROUND" value="bed6ff"\\s*/>`));
  }
  for (const heredoc of ['BASH.HERE_DOC_START', 'BASH.HERE_DOC_END']) {
    assert.match(
      scheme,
      new RegExp(`name="${heredoc}">\\s*<value>\\s*<option name="FOREGROUND" value="fd971f"\\s*/>\\s*<option name="FONT_TYPE" value="1"\\s*/>`)
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
  // baseAttributes can reset, but it cannot redirect. The fallback is fixed in IDE source by
  // createTextAttributesKey(name, fallback); naming a different one is ignored and rewritten.
  // Naming the declared one is still worth doing, because it clears whatever explicit value a
  // parent scheme sets and drops the key back to its fallback. Any key whose colour differs
  // from that fallback has to spell the colour out instead.
  for (const [key, base] of [
    ['DEFAULT_GLOBAL_VARIABLE', 'DEFAULT_IDENTIFIER'],
    ['DEFAULT_INSTANCE_FIELD', 'DEFAULT_IDENTIFIER'],
    ['DEFAULT_INSTANCE_METHOD', 'DEFAULT_FUNCTION_DECLARATION'],
    ['DEFAULT_LABEL', 'DEFAULT_IDENTIFIER'],
    ['DEFAULT_LOCAL_VARIABLE', 'DEFAULT_IDENTIFIER'],
    ['JS.GLOBAL_VARIABLE', 'DEFAULT_GLOBAL_VARIABLE'],
    ['JS.INSTANCE_MEMBER_FUNCTION', 'DEFAULT_INSTANCE_METHOD'],
    ['JS.LOCAL_VARIABLE', 'DEFAULT_LOCAL_VARIABLE'],
    ['JS.REGEXP', 'DEFAULT_STRING'],
    ['PY.ANNOTATION', 'DEFAULT_IDENTIFIER'],
    ['PY.STRING.B', 'DEFAULT_STRING'],
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
    ['KOTLIN_DYNAMIC_PROPERTY_CALL', 'cfbfad', null]
  ]) {
    const font = fontType ? `\\s*<option name="FONT_TYPE" value="${fontType}"\\s*/>` : '';
    assert.match(
      scheme,
      new RegExp(`name="${key}">\\s*<value>\\s*<option name="FOREGROUND" value="${value}"\\s*/>${font}\\s*</value>`)
    );
    assert.doesNotMatch(scheme, new RegExp(`name="${key}" baseAttributes=`));
  }
  for (const inlined of ['KOTLIN_MUTABLE_VARIABLE', 'KOTLIN_TYPE_PARAMETER', 'KOTLIN_LABEL', 'JS.REGEXP', 'CSS.COLOR']) {
    assert.match(scheme, new RegExp(`name="${inlined}"`));
  }
  assert.match(scheme, /name="KOTLIN_ARROW">\s*<value>\s*<option name="FOREGROUND" value="cfbfad"\s*\/>\s*<\/value>\s*<\/option>/);
  assert.match(scheme, /name="KOTLIN_FUNCTION_LITERAL_BRACES_AND_ARROW">\s*<value\s*\/>\s*<\/option>/);
  // Special names follow what Visual Studio Code can express: green at the definition,
  // neutral at the usage, no italic on either. Usage is pinned rather than inherited because
  // PY.PREDEFINED_USAGE falls back to DEFAULT_PREDEFINED_SYMBOL, the reserved-name pink.
  for (const [predefined, colour] of [
    ['PY.PREDEFINED_DEFINITION', 'a7ec21'],
    ['PY.PREDEFINED_USAGE', 'cfbfad']
  ]) {
    const value = scheme.match(new RegExp(`name="${predefined}">[\\s\\S]*?<value>([\\s\\S]*?)</value>`))[1];
    assert.match(value, new RegExp(`name="FOREGROUND" value="${colour}"`));
    assert.doesNotMatch(value, /FONT_TYPE/);
  }
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
    'CONSTRUCTOR_CALL_ATTRIBUTES',
    'CONSTRUCTOR_DECLARATION_ATTRIBUTES',
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
// Type parameters and built-ins carry the same identities as the IntelliJ scheme.
assert.match(vim, /highlight SM2TypeParam guifg=#fd971f[^\n]*gui=bold/);
assert.match(vim, /highlight SM2Builtin\s+guifg=#bed6ff/);
// Markup carries across the ports: headings on the function green, links underlined.
assert.match(vim, /highlight SM2Bold\s+guifg=NONE[^\n]*gui=bold/);
assert.match(vim, /highlight SM2Heading\s+guifg=#a7ec21[^\n]*gui=bold,italic/);
for (const [capture, group] of [['@markup\\.heading', 'SM2Heading'], ['@markup\\.strong', 'SM2Bold'], ['@markup\\.list', 'Statement'], ['@conceal\\.markdown_inline', 'Statement'], ['@punctuation\\.special\\.markdown', 'Statement'], ['@markup\\.link', 'Identifier'], ['@markup\\.link\\.label', 'SM2LinkText'], ['@markup\\.link\\.url', 'SM2LinkUrl'], ['@tag', 'Statement'], ['@tag\\.attribute', 'Function']]) {
  assert.match(vim, new RegExp(`link ${capture} ${group}`));
}
for (const [group, target] of [
  ['markdownBold', 'SM2Bold'], ['markdownItalic', 'SM2Static'], ['markdownHeadingDelimiter', 'SM2Heading'],
  ['markdownLinkText', 'SM2LinkText'], ['markdownLinkTextDelimiter', 'SM2LinkText'],
  ['markdownUrl', 'SM2LinkUrl'], ['markdownLinkDelimiter', 'Identifier'],
  ['markdownIdDeclaration', 'Statement'], ['markdownId', 'Statement'],
  ['markdownFootnote', 'Statement'], ['markdownFootnoteDefinition', 'Statement']
]) {
  assert.match(vim, new RegExp(`link ${group} ${target}`));
}
for (const level of [1, 2, 3, 4, 5, 6]) {
  assert.match(vim, new RegExp(`link markdownH${level} SM2Heading`));
}
for (const marker of ['markdownBoldDelimiter', 'markdownItalicDelimiter', 'markdownBoldItalicDelimiter', 'markdownStrikeDelimiter', 'markdownCodeDelimiter', 'markdownListMarker', 'markdownOrderedListMarker', 'markdownBlockquote', 'markdownRule']) {
  assert.match(vim, new RegExp(`link ${marker} Statement`));
}
const markup = name => theme.tokenColors.find(rule => rule.name === name).settings;
const punctuation = theme.tokenColors.find(rule => rule.name === 'Operators and punctuation');
for (const scope of ['punctuation.definition.bold.markdown', 'punctuation.definition.italic.markdown', 'punctuation.definition.raw.markdown', 'punctuation.definition.markdown', 'punctuation.definition.list.begin.markdown', 'punctuation.definition.quote.begin.markdown', 'punctuation.definition.strikethrough.markdown', 'punctuation.definition.table.markdown']) {
  assert.ok(punctuation.scope.includes(scope));
}
assert.equal(punctuation.settings.foreground, '#ff007f');
assert.deepEqual(markup('Markup headings'), { foreground: '#a7ec21', fontStyle: 'bold italic' });
assert.deepEqual(markup('Markup emphasis'), { fontStyle: 'bold' });
assert.deepEqual(markup('Markup italics'), { fontStyle: 'italic' });
assert.deepEqual(markup('Markup link text'), { foreground: '#52e3f6', fontStyle: 'underline' });
for (const scope of ['punctuation.definition.link.title.begin.markdown', 'punctuation.definition.link.title.end.markdown']) {
  assert.ok(theme.tokenColors.find(rule => rule.name === 'Markup link text').scope.includes(scope));
}
for (const scope of ['punctuation.definition.link.description.begin.markdown', 'punctuation.definition.link.description.end.markdown']) {
  assert.ok(theme.tokenColors.find(rule => rule.name === 'Markup link text').scope.includes(scope));
}
assert.deepEqual(markup('Markup reference labels'), { foreground: '#ff007f' });
assert.deepEqual(markup('Markup tag names'), { foreground: '#ff007f', fontStyle: 'bold' });
assert.deepEqual(markup('Markup entities'), { foreground: '#bed6ff' });
assert.deepEqual(markup('YAML anchors and aliases'), { foreground: '#bed6ff' });
assert.deepEqual(markup('Shell heredoc delimiters'), { foreground: '#fd971f', fontStyle: 'bold' });
assert.match(vim, /link @lsp\.type\.typeParameter SM2TypeParam/);
for (const builtin of ['@type\\.builtin', '@function\\.builtin', '@lsp\\.typemod\\.class\\.defaultLibrary', '@lsp\\.typemod\\.function\\.defaultLibrary']) {
  assert.match(vim, new RegExp(`link ${builtin} SM2Builtin`));
}
assert.equal(theme.semanticTokenColors['typeParameter'].foreground, '#fd971f');
for (const builtin of ['class.defaultLibrary', 'function.defaultLibrary']) {
  assert.equal(theme.semanticTokenColors[builtin], '#bed6ff');
}
for (const pythonModule of ['@module\\.python', '@module\\.builtin\\.python', '@lsp\\.type\\.namespace\\.python']) {
  assert.match(vim, new RegExp(`link ${pythonModule} Identifier`));
}
console.log('Theme definitions are valid and preserve the semantic color contract.');
