# VS Code 1.133 Tree-sitter and a PHP semantic-token prototype

Research date: 2026-08-19. Sources are limited to first-party VS Code,
Tree-sitter, `tree-sitter-php`, and Syntax Highlighter material.

## Decision

VS Code 1.133 has no stable public Tree-sitter AST service. Its incremental
Tree-sitter implementation is internal editor code, so an extension must ship
its own parser. For the prototype, derive the useful semantic-token surface of
Syntax Highlighter, but replace its implementation with a PHP-only,
incremental WASM parser. Do not use the installed VS Code copy of
`@vscode/tree-sitter-wasm`.

Use one of these dependency arrangements, not both:

1. Pin and package `@vscode/tree-sitter-wasm` 0.3.1, which already contains
   its JS binding, core WASM, and PHP grammar WASM.
2. Pin upstream `web-tree-sitter` and ship a `tree-sitter-php.wasm` built for
   that runtime's language ABI.

The first is the shortest prototype path. The second gives tighter control of
the shipped assets and follows upstream directly.

## VS Code's boundary

- The [stable 1.133 `vscode.d.ts`](https://github.com/microsoft/vscode/blob/1.133.0/src/vscode-dts/vscode.d.ts)
  exposes no Tree-sitter parser, syntax tree, node, query, or changed-range API.
  The [1.133 proposal registry](https://github.com/microsoft/vscode/blob/1.133.0/src/vs/platform/extensions/common/extensionsApiProposals.ts)
  has no Tree-sitter proposal either.
- The adjacent proposed
  [`documentSyntaxHighlighting`](https://github.com/microsoft/vscode/blob/1.133.0/src/vscode-dts/vscode.proposed.documentSyntaxHighlighting.d.ts)
  API performs a full TextMate tokenization and returns styled runs, not an AST.
  Proposed APIs are Insiders-only and cannot be used by a Marketplace extension
  ([VS Code proposed-API policy](https://code.visualstudio.com/api/advanced-topics/using-proposed-api)).
- VS Code's
  [`ITreeSitterLibraryService`](https://github.com/microsoft/vscode/blob/1.133.0/src/vs/editor/common/services/treeSitter/treeSitterLibraryService.ts),
  [workbench loader](https://github.com/microsoft/vscode/blob/1.133.0/src/vs/workbench/services/treeSitter/browser/treeSitterLibraryService.ts),
  [incremental tree](https://github.com/microsoft/vscode/blob/1.133.0/src/vs/editor/common/model/tokens/treeSitter/treeSitterTree.ts),
  and [range token replacement](https://github.com/microsoft/vscode/blob/1.133.0/src/vs/editor/common/model/tokens/treeSitter/treeSitterTokenizationImpl.ts)
  implement essentially the desired edit-old-tree, reparse, changed-range, and
  stale-version-rejection model. They live under internal `src/vs` modules and
  are not extension APIs. The loader enables only CSS, TypeScript, INI, and
  regex, not PHP.
- [`@vscode/tree-sitter-wasm`](https://github.com/microsoft/vscode-tree-sitter-wasm/blob/v0.3.1/package.json)
  is nevertheless a normal MIT-licensed npm package with a JS entry point and
  declarations. An extension can declare and ship its own pinned copy. That
  does not grant access to VS Code's parser objects, trees, caches, or private
  installed `node_modules`. Version 0.3.1 already contains the binding/runtime;
  adding a separate `web-tree-sitter` runtime would duplicate it and can create
  an ABI mismatch. Its [build list](https://github.com/microsoft/vscode-tree-sitter-wasm/blob/v0.3.1/build/main.ts)
  includes PHP.

## Correct incremental model

Tree-sitter's supported update loop is `oldTree.edit(change)`, followed by
`parser.parse(newText, oldTree)`; the new tree shares unchanged structure with
the old one ([official editing guide](https://tree-sitter.github.io/tree-sitter/using-parsers/3-advanced-parsing.html),
[Web Tree-sitter example](https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/README.md#editing)).
Use the trees' changed ranges instead of inventing a text-block heuristic.

For this feature, keep one state record per open document and one symbol/token
cache per PHP callable or other chosen enclosing AST node. Apply every VS Code
content change to the old tree, incrementally reparse, recompute only enclosing
nodes intersecting the changed ranges, and retain the previous published token
data when classifications did not change. Reject work whose document version is
stale and delete old trees explicitly.

The official PHP grammar exposes parameter nodes such as `simple_parameter`,
but its stock [highlight query](https://github.com/tree-sitter/tree-sitter-php/blob/v0.24.2/queries/highlights.scm)
classifies every `variable_name` as `@variable`; it does not resolve parameter
uses. The prototype therefore still needs a small callable-scope pass: collect
parameter names, classify matching variable nodes in that callable while
respecting nested callables, and emit VS Code's standard `parameter` token.

## Existing `evgeniypeshkov.syntax-highlighter`

The [Marketplace extension](https://marketplace.visualstudio.com/items?itemName=evgeniypeshkov.syntax-highlighter)
is the closest existing design, but not a suitable runtime dependency for this
problem.

- It uses `web-tree-sitter`/WASM and registers a
  `DocumentSemanticTokensProvider`; it does not use hardcoded editor
  decorations. Its [manifest](https://github.com/EvgeniyPeshkov/syntax-highlighter/blob/master/package.json)
  pins `web-tree-sitter` 0.19.1 and old 0.19-era grammars.
- It supports C, C++, Python, TypeScript/TSX, JavaScript, Go, Rust, PHP, Ruby,
  shell/Bash, OCaml, Lua, and (on repository master) D.
- It emits `type`, `namespace`, `function`, `variable`, `number`, `string`,
  `comment`, `variable.readonly.defaultLibrary`, `macro`, `keyword`, `operator`,
  `type.modification`, and custom `punctuation` semantic classifications
  ([Marketplace token list](https://marketplace.visualstudio.com/items?itemName=evgeniypeshkov.syntax-highlighter)).
  It has no `parameter` classification, and its
  [PHP mapping](https://github.com/EvgeniyPeshkov/syntax-highlighter/blob/master/grammars/php.json)
  treats PHP variables generically. Invariant's existing `parameter` rule
  therefore cannot solve the requested distinction with this release.
- Its [provider source](https://github.com/EvgeniyPeshkov/syntax-highlighter/blob/master/src/extension.ts)
  calls `parser.parse(doc.getText())` and walks the entire tree for every full
  semantic-token request; it never edits/reuses the prior tree for parsing.
  Open issue [#46](https://github.com/EvgeniyPeshkov/syntax-highlighter/issues/46)
  records that missing incremental behavior, and
  [#67](https://github.com/EvgeniyPeshkov/syntax-highlighter/issues/67)
  reports an unresponsive extension host.
- The Marketplace still serves 0.5.0 (last updated in 2020); repository master
  says 0.5.1 and its latest default-branch commit is from 2021. Its
  `engines.vscode` range allows installation on 1.133, but that is not evidence
  of current runtime compatibility. The repository's contribution links point
  to absent files, while its TODO still asks for instructions on adding a
  language. A PR is possible under MIT, but deriving/forking is the reliable
  path for an immediate prototype.

Invariant can style this extension's existing outputs solely with
`semanticTokenColors`, because that is exactly how VS Code themes consume
semantic tokens ([Semantic Highlight Guide](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#theming)).
That only controls colors: it cannot add the missing `parameter` token, repair
its PHP model, or make its parser incremental.

## WASM versus native Node bindings

Native `tree-sitter` is faster; upstream explicitly says WASM in Node is
"considerably slower" ([Web Tree-sitter README](https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/README.md#running-wasm-in-nodejs)).
Native addons, however, require Electron and remote-Node compatibility plus an
OS, CPU, and libc distribution matrix
([VS Code remote native-module guidance](https://code.visualstudio.com/api/advanced-topics/remote-extensions#using-native-nodejs-modules),
[platform-specific VSIX documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#platform-specific-extensions)).
WASM gives one portable prototype across local and remote extension hosts and
can later support a web extension. Use native bindings only if profiling the
incremental PHP implementation proves WASM is the bottleneck.

Tree-sitter core, `web-tree-sitter`, `tree-sitter-php`, Syntax Highlighter, and
Microsoft's WASM package are MIT-licensed. Redistribution is allowed, but the
copyright and permission notices must accompany the binaries
([Tree-sitter license](https://github.com/tree-sitter/tree-sitter/blob/master/LICENSE),
[PHP grammar license](https://github.com/tree-sitter/tree-sitter-php/blob/master/LICENSE)).
