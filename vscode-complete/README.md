<!-- markdownlint-disable MD013 MD033 MD041 -->

<div align="center">

<img src="https://raw.githubusercontent.com/andrebrait/invariant-colors/master/vscode-complete/images/equation.png" alt="Invariant Colors plus Invariant Highlighter equals Invariant Complete" width="760">

<h1>Invariant Complete</h1>

<p><strong>The complete Invariant experience for Visual Studio Code, in one install.</strong></p>

<p>
  <a href="https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors-complete"><img src="https://img.shields.io/badge/Install-Visual%20Studio%20Marketplace-007acc?logo=visualstudiocode" alt="Install from Visual Studio Marketplace"></a>
  <a href="https://open-vsx.org/extension/andrebrait/invariant-colors-complete"><img src="https://img.shields.io/badge/Install-Open%20VSX-c160ef" alt="Install from Open VSX"></a>
</p>

<p>
  <a href="https://github.com/andrebrait/invariant-colors/stargazers"><img src="https://img.shields.io/github/stars/andrebrait/invariant-colors?style=flat&amp;logo=github" alt="GitHub stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/andrebrait/invariant-colors?style=flat" alt="Eclipse Public License 2.0"></a>
</p>

</div>

<!-- markdownlint-enable MD013 MD033 MD041 -->

Invariant Complete is deliberately small: it is an extension pack, not a third
theme or highlighting runtime. Installing it asks VS Code to install both Invariant
components:

| Extension | What it adds |
| --- | --- |
| [Invariant](https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors) | A semantic dark color theme based on Monokai |
| [Invariant Highlighter](https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors-highlighter) | Parameter identity and modified-symbol enhancements where language services leave gaps |

## Getting started

Install Invariant Complete, then select **Invariant** from **Preferences: Color
Theme**. Highlighter activates automatically for its supported languages.

```sh
code --install-extension andrebrait.invariant-colors-complete
```

Highlighter supports per-language opt-out through
`invariantHighlighter.languages`. See the
[Highlighter README][highlighter-readme] for features, supported languages,
configuration, and current limits.

## Independent components

The theme and Highlighter remain independently manageable after installation.
Disable or uninstall Highlighter whenever you want the passive color theme alone.

Complete stores extension IDs, not version pins. VS Code installs the latest
compatible release of each component and updates them independently. Complete only
needs another release when the pack membership or its own metadata changes.

## Development

```sh
npm run package
```

Install the generated VSIX with:

```sh
code --install-extension invariant-colors-complete-1.0.0.vsix --force
```

## License

Invariant Complete is licensed under the Eclipse Public License 2.0.

[highlighter-readme]: https://github.com/andrebrait/invariant-colors/blob/master/vscode-highlighter/README.md
