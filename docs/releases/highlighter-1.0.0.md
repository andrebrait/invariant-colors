# Invariant Highlighter 1.0.0

The first stable release of Invariant Highlighter adds semantic information that
Visual Studio Code and its language services do not always expose to color themes.

## Features

- Every occurrence of a PHP parameter inside its function receives the standard
  `parameter` semantic token type.
- Reassigned parameters and variables are underlined throughout their syntax scope
  without replacing their existing language-service colors.
- Modified-symbol highlighting supports PHP, Python, Java, and Shell Script.
- Incremental Tree-sitter analysis updates changed scopes while reusing unchanged
  syntax trees and classifications.
- `invariantHighlighter.languages` can disable individual adapters or all
  Highlighter behavior.

The extension works with Invariant or any other theme. The packaged VSIX is attached
to this release.
