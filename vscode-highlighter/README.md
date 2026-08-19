<!-- markdownlint-disable MD013 MD033 MD041 -->

<div align="center">

<img src="https://raw.githubusercontent.com/andrebrait/invariant-colors/master/vscode-highlighter/images/icon.png" alt="Invariant Highlighter logo" width="150">

<h1>Invariant Highlighter</h1>

<p><strong>More precise code highlighting for VS Code, layered on top of its existing syntax and semantic highlighting.</strong></p>

<p>
  <a href="https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors-highlighter"><img src="https://img.shields.io/badge/Install-Visual%20Studio%20Marketplace-007acc?logo=visualstudiocode" alt="Install from Visual Studio Marketplace"></a>
  <a href="https://open-vsx.org/extension/andrebrait/invariant-colors-highlighter"><img src="https://img.shields.io/badge/Install-Open%20VSX-c160ef" alt="Install from Open VSX"></a>
</p>

<p>
  <a href="https://github.com/andrebrait/invariant-colors/stargazers"><img src="https://img.shields.io/github/stars/andrebrait/invariant-colors?style=flat&amp;logo=github" alt="GitHub stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/andrebrait/invariant-colors?style=flat" alt="Eclipse Public License 2.0"></a>
</p>

</div>

<!-- markdownlint-enable MD013 MD033 MD041 -->

VS Code combines syntax scopes from TextMate grammars with semantic tokens from
language extensions. Those sources do not always expose every distinction a theme
could use. A language service may understand that several references are the same
parameter for navigation, for example, while the highlighting pipeline classifies
only the declaration as a parameter.

Invariant Highlighter fills selected gaps with incremental Tree-sitter
analysis. It adds only the missing information; it does not replace the active
grammar, language service, or color theme.

The extension is designed for
[Invariant](https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors),
but can complement any color theme. The theme determines the parameter color;
modified-symbol underlining is added independently.

## Features

### Consistent PHP parameter highlighting

Every occurrence of a PHP parameter inside its function is published as the standard
semantic token type `parameter`, not only the declaration. The active theme chooses
the color; Invariant uses blue and enables semantic highlighting by default.

![PHP parameter references consistently highlighted by Invariant Highlighter](https://raw.githubusercontent.com/andrebrait/invariant-colors/master/docs/images/vscode-highlighter-parameters.png)

The `$migration` and `$max` declarations and references share the same parameter
color throughout the function.

### Modified-symbol highlighting

When a parameter is assigned or a variable is assigned again, every occurrence
of that symbol in its scope is underlined. This makes mutation visible at a
glance while preserving the symbol's existing color.

![Modified PHP parameters and variables underlined in VS Code](https://raw.githubusercontent.com/andrebrait/invariant-colors/master/docs/images/vscode-highlighter-modified.png)

Every `$max` and `$cfg` occurrence is underlined, including occurrences before
the assignment that made the symbol count as modified. This image is a live VS
Code editor capture because re-tokenizing screenshot tools do not preserve editor
decorations.

### Incremental updates

The first analysis parses the document once. Later edits update the existing
syntax tree and reclassify changed scopes while reusing unchanged function,
class, and file results. Existing decorations are only replaced when their
ranges or classification change, avoiding whole-file flashes during normal
editing.

## Language support

| Language | Parameter identity | Modified symbols |
| --- | --- | --- |
| PHP | Yes | Yes |
| Python | Existing language service | Yes |
| Java | Existing language service | Yes |
| Shell Script | Not applicable | Yes |

Kotlin is not intercepted because its language service can publish the standard
`modification` semantic modifier directly.

## How it composes with VS Code

- TextMate grammars continue to color keywords, strings, punctuation, and other
  syntax.
- Language extensions continue to provide their semantic tokens, navigation,
  diagnostics, completion, and refactoring.
- Invariant Highlighter adds parameter identity where needed and overlays an
  underline on modified symbols.
- The active color theme remains responsible for colors and semantic-token styles.

PHP parameter identity uses standard semantic tokens. Modified-symbol highlighting
uses editor decorations so it can coexist with Pylance, JDT LS, Intelephense, and
other existing highlighting instead of replacing their token providers.

## Configuration

`invariantHighlighter.languages` lists enabled language IDs. All supported languages
are enabled by default:

```json
{
  "invariantHighlighter.languages": [
    "php",
    "python",
    "java",
    "shellscript"
  ]
}
```

Remove a language to leave it entirely to its existing grammar and language service.
Use an empty list to disable all Highlighter behavior without uninstalling it.
VS Code can also disable the extension globally or for an individual workspace.

## Current limits

The first release recognizes parameters, direct assignments, augmented assignments,
and update expressions within syntax scopes. It does not perform full language-server
symbol resolution. Captures and definitions introduced by constructs such as loops
may require additional language-specific handling.

## Design and provenance

The implementation derives from the MIT-licensed semantic-token approach used by
[Syntax Highlighter](https://github.com/EvgeniyPeshkov/syntax-highlighter), with
current Tree-sitter WASM, incremental tree edits, and per-scope classification caches.

Invariant Highlighter is a separate extension because a passive color theme can
style tokens but cannot create semantic information that VS Code and its
language extensions do not publish. Users who want the theme and Highlighter
together can install
[Invariant Complete](https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors-complete).

## Development

```sh
npm test
npm run package
```

Install the generated VSIX with:

```sh
code --install-extension invariant-colors-highlighter-0.1.0.vsix --force
```

## License

Invariant Highlighter is licensed under the Eclipse Public License 2.0. Bundled
Tree-sitter components retain their respective MIT licenses; see
`THIRD_PARTY_NOTICES.md`.
