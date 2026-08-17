<div align="center">

<img src="assets/icon.svg" alt="Invariant logo" width="150">

<h1>Invariant</h1>

<p><strong>A semantic dark editor color scheme based on Monokai.</strong></p>

<p>
  <a href="https://plugins.jetbrains.com/plugin/33563-invariant"><img src="https://img.shields.io/badge/Install-JetBrains%20Marketplace-000000?logo=jetbrains" alt="Install from JetBrains Marketplace"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors"><img src="https://img.shields.io/badge/Install-Visual%20Studio%20Marketplace-007acc?logo=visualstudiocode" alt="Install from Visual Studio Marketplace"></a>
</p>

<p>
  <a href="https://github.com/andrebrait/invariant-colors/stargazers"><img src="https://img.shields.io/github/stars/andrebrait/invariant-colors?style=flat&logo=github" alt="GitHub stars"></a>
  <a href="https://github.com/andrebrait/invariant-colors/releases"><img src="https://img.shields.io/github/v/release/andrebrait/invariant-colors?include_prereleases&style=flat" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/andrebrait/invariant-colors?style=flat" alt="Eclipse Public License 2.0"></a>
</p>

</div>

Invariant grew from an Eclipse theme I started using in 2014 and is primarily maintained for IntelliJ IDEA, with ports for Visual Studio Code and Vim/Neovim.

The scheme uses color to identify what a symbol is and formatting to show how it is being used. Common code stays relatively quiet, while types, parameters, methods, and reserved words remain easy to find.

![Java example using Invariant](docs/images/intellij-java.png)

## Semantic colors

The same kind of symbol should keep the same foreground wherever it appears. A class does not change color when used as a constructor or a static qualifier, and a field does not become a different color merely because it is read from another expression.

| Meaning | Style | Examples |
| --- | --- | --- |
| Variables and fields | ![#cfbfad](docs/images/swatches/cfbfad.svg) Warm neutral `#cfbfad` | Locals, instance fields, global variables |
| Parameters | ![#79abff](docs/images/swatches/79abff.svg) Blue `#79abff` | Function, method, and lambda parameters |
| Types | ![#52e3f6](docs/images/swatches/52e3f6.svg) Cyan `#52e3f6` | Classes, interfaces, records |
| Type parameters | ![#fd971f](docs/images/swatches/fd971f.svg) Bold orange `#fd971f` | Generic type declarations and references |
| Implemented methods | ![#a7ec21](docs/images/swatches/a7ec21.svg) Green `#a7ec21` | Concrete declarations and calls |
| Signature-only / built-in | ![#bed6ff](docs/images/swatches/bed6ff.svg) Pale blue `#bed6ff` | Abstract and interface methods; runtime built-ins such as `int` and `len` |
| Keywords and reserved names | ![#ff007f](docs/images/swatches/ff007f.svg) Bold pink `#ff007f` | `class`, `return`, `this`, `self`, `null` |
| Strings | ![#ece47e](docs/images/swatches/ece47e.svg) Pale yellow `#ece47e` | String and character literals |
| Numbers | ![#c48cff](docs/images/swatches/c48cff.svg) Purple `#c48cff` | Numeric literals |
| Annotations and metadata | ![#ffffff](docs/images/swatches/ffffff.svg) White `#ffffff` | Annotations and attribute names |
| Comments | ![#ffffff](docs/images/swatches/ffffff.svg) White `#ffffff` | Line, block, and documentation comments |

Comments are intentionally prominent. A comment should be noticed, and a file with too many comments should look like it has too many comments.

### Color says what; formatting says how

Context normally adds formatting without replacing a symbol's identity color:

- A reassigned variable or parameter gains an underline but keeps its foreground.
- Static members are italic; instance members are not.
- Inspection results add their underline, wave, border, or background over the existing syntax colors.
- Read-only and other contextual distinctions may use bold or italic where the editor exposes them reliably.

A captured Java variable is a useful boundary case. A method parameter is blue in the enclosing method, but IntelliJ presents its use inside a lambda as a neutral field-like capture. Its semantic role has changed: the generated lambda object effectively carries that value as state.

Method implementation is the deliberate foreground exception. Concrete methods are green, while methods that only provide a signature are pale blue. This makes calls through an interface or abstract type distinguishable without navigating to the declaration first.

## Examples

### Java

The Java example includes a record, fields, parameters, a reassigned local, static members, an interface method, and captured values inside lambdas. The parameter declarations are blue; their captured uses inside the lambda are neutral. Concrete calls are green, while the interface call uses the signature-only method color.

![Java lambda captures using Invariant](docs/images/intellij-java-lambdas.png)

The lambda parameter remains blue, while values captured from the enclosing method gain a neutral highlight without changing their underlying semantic color. The [same capture with IntelliJ inlay hints enabled](docs/images/intellij-java-lambdas-hints.png) is also kept for comparison.

### Kotlin

![Kotlin example using Invariant](docs/images/intellij-kotlin.png)

Kotlin follows the same language-default meanings for types, parameters, variables, and functions. Kotlin-specific entries are kept only where the plugin exposes a distinct concept, such as named arguments, smart casts, or function-literal punctuation. Lambda arrows remain neutral, matching Java.

### Python

![Python example using Invariant](docs/images/intellij-python.png)

Python keeps parameters blue, fields neutral, calls green, and reserved names such as `self` and `cls` pink. Built-in names remain pale blue. Special names are green and italic wherever they appear, at their definition and at their use.

Imported modules and packages read as ordinary identifiers in the warm neutral `#cfbfad`. IntelliJ's Python plugin exposes no color key for module references, so the name in `import os` or in an `os.path` qualifier simply keeps the default foreground. The other ports are pinned to match: without an explicit rule, Visual Studio Code would color modules with the cyan `namespace` token and Neovim would inherit a type-like default from the `@module` capture, both of which would make a module read as a type in one editor but not another.

## Language support

IntelliJ's Language Defaults provide the base mapping for every language that uses them. The following languages also have explicit entries in the scheme:

| Language | Explicit coverage |
| --- | --- |
| Java | Primary target; declarations, calls, fields, captures, records, annotations, and implementation distinctions |
| Kotlin | Kotlin-specific operators, arrows, dynamic calls, named arguments, and smart-cast contexts |
| Python | Built-ins, `self`, predefined names, annotations, and type parameters |
| CSS | Classes, functions, hashes, identifiers, and property names |
| Shell Script | External commands and subshell commands |

Other IntelliJ languages receive the semantic Language Defaults automatically. Their plugins may add concepts that have not yet been tuned here.

## Installation

### JetBrains IDEs

[![Install from JetBrains Marketplace](https://img.shields.io/badge/Install-JetBrains%20Marketplace-000000?logo=jetbrains)](https://plugins.jetbrains.com/plugin/33563-invariant)

Install **Invariant** from the Plugins Marketplace, or import [`jetbrains/invariant.icls`](jetbrains/invariant.icls) manually from **Settings → Editor → Color Scheme → Import Scheme**.

### Visual Studio Code

[![Install from Visual Studio Marketplace](https://img.shields.io/badge/Install-Visual%20Studio%20Marketplace-007acc?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=andrebrait.invariant-colors)

Install **Invariant** from the Extensions Marketplace and select it from **Preferences: Color Theme**. To test the source locally, open the [`vscode`](vscode) directory in Visual Studio Code and press `F5`.

From the Command Palette, run:

```text
ext install andrebrait.invariant-colors
```

### Vim or Neovim

With [lazy.nvim](https://github.com/folke/lazy.nvim), add:

```lua
{
  "andrebrait/invariant-colors",
  lazy = false,
  priority = 1000,
  config = function()
    vim.cmd.colorscheme("invariant")
  end,
}
```

For vim-plug, use `Plug 'andrebrait/invariant-colors'`. You can also copy [`colors/invariant.vim`](colors/invariant.vim) into `~/.vim/colors/` or `~/.config/nvim/colors/`. Then configure:

```vim
colorscheme invariant
```

True-color terminals give the intended palette; a 256-color fallback is included.

## Editor differences

JetBrains IDEs can distinguish captures and whether a Java method has an implementation. Visual Studio Code and Neovim preserve the distinctions emitted by their language services, but a color theme cannot infer semantic information that the service does not provide. Plain Vim syntax highlighting cannot determine captures or abstract versus concrete methods.

### Platform backgrounds

The IntelliJ scheme inherits from Islands Dark. IntelliJ inherits a text-attribute entry as a whole, so the scheme cannot keep its warm-neutral default foreground while inheriting only the editor background. The `TEXT` background therefore copies Islands Dark 2026.2's `#191a1c` value.

The console, documentation popup, completion popup, and gutter backgrounds remain inherited. Their current Islands Dark values are recorded in comments in the `.icls` file. The Vim port uses those same fixed surfaces.

The Visual Studio Code port instead uses the current VS Code Dark surfaces: `#121314` for the editor and gutter, `#191a1b` for the terminal and peek views, and `#202122` for documentation and completion widgets.

## Verification

```sh
npm test --prefix vscode
npm run package --prefix vscode
gradle -p jetbrains buildPlugin verifyPlugin
```

## Releasing

Publishing a GitHub Release runs [the release workflow](.github/workflows/release.yml). The tag must match the version in [`vscode/package.json`](vscode/package.json), using `1.0.0` rather than `v1.0.0`. The workflow attaches both installable archives to the GitHub Release. Stable releases also publish the VS Code extension and JetBrains plugin; prereleases remain downloadable from GitHub only. Vim and Neovim package managers use the same Git tag directly.

Before the first stable release, create the JetBrains Marketplace plugin and add the `INTELLIJ_PUBLISH_TOKEN` Actions secret. Add the Visual Studio Marketplace token as the `VSCE_PAT` Actions secret. Neither extension requires a signing certificate.

## Provenance

Invariant descends from the [Sublime Text 2](https://github.com/eclipse-color-theme/eclipse-color-theme/blob/19b3d30e7d20f358c1a6638829ddddbe1e98cd84/com.github.eclipsecolortheme/src/com/github/eclipsecolortheme/themes/sublime-text-2.xml) Eclipse color theme by Filip Minev, distributed with Eclipse Color Theme under EPL-1.0. That scheme is based on [Monokai](https://monokai.pro/history), created by Wimer Hazenberg. Invariant preserves its distinctive semantic palette while incorporating years of changes and ports to current editors.

## License

Invariant is licensed under the [Eclipse Public License 2.0](LICENSE). Its source is available in this repository under the same license.
