# Intelephense semantic parameter highlighting

## Conclusion

VS Code can already theme a parameter declaration and every reference with the same
colour. The missing piece is a semantic-token provider in the Intelephense language
server, not a new VS Code API or another Invariant rule.

The concrete upstream target is
[`bmewburn/vscode-intelephense#1021`](https://github.com/bmewburn/vscode-intelephense/issues/1021),
which has tracked “Support semantic highlighting” since 2020 and remains open. A
separate report established the boundary explicitly: the maintainer said that the
extension does not register a semantic-token provider because it has not been
implemented yet, and redirected the work to #1021
([issue #2067](https://github.com/bmewburn/vscode-intelephense/issues/2067#issuecomment-997127684)).

## Why click-highlighting already works

An LSP `initialize` probe against the installed Intelephense 1.18.5 server returned
`documentHighlightProvider: true` and no `semanticTokensProvider`. That matches the
visible behaviour: clicking a variable invokes `textDocument/documentHighlight`,
whose result contains ranges and, optionally, only `Text`, `Read`, or `Write` kinds.
It carries no persistent symbol class such as `parameter`, so a colour theme cannot
use it to distinguish parameters from ordinary variables
([LSP document-highlight specification](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/lsp/3.18/language/documentHighlight.md)).

Semantic highlighting is a separate request path. Its result assigns each range a
token type and modifiers using a negotiated legend; the server advertises it through
the optional `semanticTokensProvider` capability
([LSP semantic-token specification](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/lsp/3.18/language/semanticTokens.md#server-capability)).

## Smallest useful upstream implementation

The first useful slice does not need a PHP-specific token type:

| PHP occurrence | Semantic classification |
|---|---|
| Formal parameter declaration | `parameter.declaration` |
| Read/reference to that parameter | `parameter` |
| Assignment to that parameter | `parameter.modification` |

VS Code defines `parameter` for identifiers that declare **or reference** function
or method parameters, and already defines the `declaration` and `modification`
modifiers
([VS Code semantic classifications](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#standard-token-types-and-modifiers)).

The server work is therefore:

1. Advertise a semantic-token legend and at least a full-document provider.
2. Walk variable occurrences in the current PHP document and reuse Intelephense's
   existing symbol resolution to identify those whose resolved declaration is a
   formal parameter.
3. Emit `parameter` for the declaration and all resolved uses, adding the standard
   modifiers above where applicable.
4. Add protocol-level tests covering an ordinary function, method, closure, arrow
   function, shadowed local, and a write to a parameter.

Range and delta support can follow later; the LSP permits a full-document provider,
and VS Code supports that form directly
([VS Code provider API](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#semantic-token-provider)).
The potentially substantial part is not the parameter classification itself, but
introducing the first semantic-token pipeline and keeping its ranges current while
documents change.

## Contribution feasibility

The public repository is the MIT-licensed VS Code client. Its current manifest pulls
the separate `intelephense` server as an npm dependency, and the client merely starts
that bundled server
([package.json](https://github.com/bmewburn/vscode-intelephense/blob/8935a6dba162b36ea22137baa14934544ea7cd43/package.json),
[`src/extension.ts`](https://github.com/bmewburn/vscode-intelephense/blob/8935a6dba162b36ea22137baa14934544ea7cd43/src/extension.ts#L204-L220)).
The bundled server licence permits use but forbids modifying or reverse-engineering
the server
([repository licence](https://github.com/bmewburn/vscode-intelephense/blob/8935a6dba162b36ea22137baa14934544ea7cd43/LICENSE.txt)).

Consequently, an outside pull request cannot implement the core classification in
the public client repository. The practical upstream contribution is to add the
minimal acceptance criteria above to #1021, offer black-box LSP fixtures and VS Code
verification, and ask the maintainer whether they will implement or accept sponsored
work in the private server. A separate extension could build its own PHP semantic
analyser, but that would duplicate Intelephense's resolver and is not a sensible
theme-level workaround.

## Invariant is already ready

Invariant enables semantic highlighting and already maps `parameter` to `#79abff` in
[`vscode/invariant-color-theme.json`](../../vscode/invariant-color-theme.json).
Once Intelephense emits the standard token, VS Code will apply that rule to both the
declaration and its uses. VS Code theme selectors may also target forms such as
`parameter.declaration:php`; they control foreground and font style
([VS Code semantic theming](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#theming)).
No Invariant change is required for the desired uniform parameter blue.
