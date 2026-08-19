<div align="center">

# Invariant Highlighter

**Incremental semantic highlighting that complements Invariant and existing language services.**

</div>

Invariant Highlighter adds semantic distinctions that the active VS Code language
service does not expose, without replacing its existing colors.

It currently provides:

- PHP parameter identity, so declarations and references share the theme's
  `parameter` color.
- Reassigned-symbol underlining for PHP, Python, Java, and Shell Script.
- Incremental Tree-sitter parsing with per-scope classification reuse.

The extension is designed for
[Invariant](https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors),
but modified-symbol underlining works with any color theme.

## Configuration

`invariantHighlighter.languages` lists enabled language IDs. The default is:

```json
[
  "php",
  "python",
  "java",
  "shellscript"
]
```

Remove individual languages to leave them entirely to their existing grammar and
language service. Use an empty list to disable all highlighting. VS Code can also
disable the extension globally or per workspace.

Kotlin is not overridden because the official JetBrains Kotlin language server
advertises the standard `modification` semantic modifier.

## Design

The implementation derives from the MIT-licensed semantic-token approach used by
[Syntax Highlighter](https://github.com/EvgeniyPeshkov/syntax-highlighter), while
using current Tree-sitter WASM, incremental tree edits, and per-scope classification
caches.

PHP parameter identity is published as a standard semantic token. Modified-symbol
underlining for Python, Java, and Shell uses editor decorations because VS Code selects
one semantic-token provider rather than merging partial providers; this preserves
Pylance, JDT LS, TextMate, and other existing highlighting.

## Current limits

The first release covers parameters, simple assignments, augmented assignments, and
updates. Captured variables and definitions introduced by constructs such as loops
need adapter-specific handling.

## Development

```sh
npm test
npm run package
```

The generated VSIX can be installed with:

```sh
code --install-extension invariant-colors-highlighter-0.1.0.vsix --force
```

## License

Invariant Highlighter is licensed under the Eclipse Public License 2.0. Bundled
Tree-sitter components retain their respective MIT licenses; see
`THIRD_PARTY_NOTICES.md`.
