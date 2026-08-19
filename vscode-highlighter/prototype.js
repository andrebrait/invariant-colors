const assert = require('node:assert/strict');
const { createIndex, initializeLanguages } = require('./language-index');
const manifest = require('./package.json');

async function main() {
  assert.equal(manifest.name, 'invariant-colors-highlighter');
  assert.equal(manifest.publisher, 'andrebrait');
  assert.deepEqual(
    manifest.contributes.configuration.properties['invariantHighlighter.languages'].default,
    ['php', 'python', 'java', 'shellscript']
  );
  const before = `<?php
function clamp($max, $unchanged) {
    if ($max <= 0) {
        return 0;
    }
    return $unchanged;
}

function other($value) {
    $cfg = read();
    $cfg = read();
    return $value;
}
`;
  const insertion = '    $max = 3;\n';
  const insertAt = before.indexOf('}\n\nfunction other');
  const after = before.slice(0, insertAt) + insertion + before.slice(insertAt);
  await initializeLanguages(['php', 'python', 'java', 'shellscript']);
  const index = createIndex('php', before);
  const changed = index.update(after, [{ rangeOffset: insertAt, rangeLength: 0, text: insertion }]);

  assert.equal(changed, true);
  assert.ok(index.index.reused >= 1, 'an unchanged function scope should reuse its classification');

  const max = index.tokens.filter(({ name }) => name === '$max');
  assert.ok(max.length >= 3);
  assert.ok(max.every(token => token.type === 'parameter'));
  assert.ok(max.every(token => token.modifiers.includes('modification')));

  const unchanged = index.tokens.filter(({ name }) => name === '$unchanged');
  assert.ok(unchanged.every(token => token.type === 'parameter'));
  assert.ok(unchanged.every(token => token.modifiers.length === 0));

  const cfg = index.tokens.filter(({ name }) => name === '$cfg');
  assert.equal(cfg.length, 2);
  assert.ok(cfg.every(token => token.type === 'variable'));
  assert.ok(cfg.every(token => token.modifiers.includes('modification')));

  const whitespace = after.indexOf('return $unchanged;');
  const whitespaceOnly = after.slice(0, whitespace) + ' ' + after.slice(whitespace);
  assert.equal(index.update(whitespaceOnly, [{ rangeOffset: whitespace, rangeLength: 0, text: ' ' }]), true);
  assert.ok(index.tokens.filter(({ name }) => name === '$max').every(token =>
    token.modifiers.includes('modification')
  ));

  index.delete();

  for (const [languageId, source, modifiedNames] of [
    ['python', `def clamp(max_value):
    max_value = 3
    cfg = read()
    cfg = read()
    return max_value
`, ['max_value', 'cfg']],
    ['java', `class Demo {
    int clamp(int max) { max = 3; return max; }
    void other() { int cfg = read(); cfg = read(); }
}
`, ['max', 'cfg']],
    ['shellscript', `foo=1
foo=2
echo "$foo"
f() { local x=1; x=2; echo "$x"; }
`, ['foo', 'x']]
  ]) {
    const languageIndex = createIndex(languageId, source);
    for (const name of modifiedNames) {
      const matches = languageIndex.tokens.filter(token => token.name === name);
      assert.ok(matches.length >= 2, `${languageId} should find every ${name} occurrence`);
      assert.ok(matches.every(token => token.modifiers.includes('modification')));
    }
    languageIndex.delete();
  }

  console.log(`Incremental PHP/Python/Java/Shell scope indexes passed; reused ${index.index.reused} unchanged scope(s).`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
