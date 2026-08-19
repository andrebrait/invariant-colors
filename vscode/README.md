<div align="center">

<img src="https://raw.githubusercontent.com/andrebrait/invariant-colors/master/vscode/images/icon.png" alt="Invariant logo" width="128">

# Invariant

**A semantic dark editor theme based on Monokai.**

</div>

Invariant uses color to identify what a symbol is and formatting to show how it is being used. Common code stays relatively quiet, while types, parameters, methods, reserved names, annotations, and comments remain easy to find.

![Java example using Invariant](https://raw.githubusercontent.com/andrebrait/invariant-colors/master/docs/images/intellij-java.png)

## Color says what; formatting says how

- Variables and fields use a warm neutral foreground.
- Parameters are blue and types are cyan.
- Concrete method calls are green; signature-only methods are pale blue when the language service exposes that distinction.
- Keywords and reserved names such as `this`, `self`, and `cls` are bold pink.
- Static members are italic without changing their semantic color.
- Comments and annotations are intentionally white and prominent.
- Reassignment and other contextual states add formatting instead of replacing a symbol's identity color.

## Examples

### Java lambdas

![Java lambda captures using Invariant](https://raw.githubusercontent.com/andrebrait/invariant-colors/master/docs/images/intellij-java-lambdas.png)

Parameters remain blue while captured values gain contextual treatment. Concrete calls remain green throughout the expression.

### Kotlin

![Kotlin example using Invariant](https://raw.githubusercontent.com/andrebrait/invariant-colors/master/docs/images/intellij-kotlin.png)

### Python

![Python example using Invariant](https://raw.githubusercontent.com/andrebrait/invariant-colors/master/docs/images/intellij-python.png)

Python keeps parameters blue, fields neutral, calls green, and reserved instance and class references such as `self` and `cls` bold pink.

## Language support

Visual Studio Code applies the shared palette through TextMate scopes and semantic tokens. The exact distinctions available depend on each language extension: the theme preserves semantic information emitted by the language service, but it cannot infer information the service does not provide.

## Installation

Install **Invariant** from the Extensions Marketplace and select it from **Preferences: Color Theme**. From the Command Palette, run:

```text
ext install andrebrait.invariant-colors
```

For Tree-sitter-backed PHP parameter identity and reassigned-symbol underlining, install
the optional [Invariant Highlighter](https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors-highlighter).
Install [Invariant Complete](https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors-complete)
to get both independently manageable extensions together.

See the [project README](https://github.com/andrebrait/invariant-colors#readme) for the complete palette, editor differences, Vim and Neovim installation, and provenance. Problems and suggestions are tracked in [GitHub Issues](https://github.com/andrebrait/invariant-colors/issues).

## License

[Eclipse Public License 2.0](https://github.com/andrebrait/invariant-colors/blob/master/LICENSE)
