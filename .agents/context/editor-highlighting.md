# Editor-highlighting context

Read the relevant research note before changing a cross-editor mapping:

- IntelliJ color-key fallbacks and language-plugin overrides:
  `docs/research/intellij-language-color-inheritance.md`
- VS Code function-call scopes and the known R exception:
  `docs/research/vscode-function-call-scope-compatibility.md`
- Intelephense parameter-token boundary:
  `docs/research/intelephense-semantic-parameter-highlighting.md`
- VS Code Tree-sitter API boundary and incremental Highlighter design:
  `docs/research/vscode-tree-sitter-php-extension.md`

Important ceilings:

- A passive VS Code theme can style tokens but cannot create semantic information or
  token backgrounds. Parent TextMate scopes color descendants, including punctuation.
- VS Code exposes no stable public Tree-sitter AST API. Highlighter ships one pinned
  `@vscode/tree-sitter-wasm` runtime and incrementally edits and reparses its own trees.
- Click highlighting and semantic highlighting are separate APIs. A language service may
  navigate every occurrence while publishing no persistent, themeable symbol identity.
- Highlighter uses semantic tokens for missing PHP parameter identity and editor
  decorations for modification underlines, preserving semantic colors from existing
  language services.
- An IntelliJ scheme cannot redirect a color key's source-defined fallback. Bundled
  language plugins can override generic Language Defaults, and TextMate fallback keys
  may be global across languages.
- Verify a language using the editor's actual token/key inspection and a project with
  its language SDK. A plausible generic mapping is not evidence of rendered behavior.
