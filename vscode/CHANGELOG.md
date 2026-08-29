# Changelog

## 1.3.2

- JSON, JSON with Comments, and JSON Lines property names now use the neutral variable/property color instead of type cyan, matching IntelliJ's field styling.
- Read-only semantic tokens no longer become bold, so a local `const` keeps the same variable styling as a local `let`.

## 1.3.1

- The JetBrains plugin now installs a color scheme the IDE can actually load. It named Islands Dark as its parent scheme, which is contributed by a plugin and is absent unless the Islands UI is active, so IntelliJ discarded the scheme on load and Invariant never appeared under Settings | Editor | Color Scheme. The scheme now inherits from Darcula and spells out every color and attribute it had been inheriting, leaving its appearance unchanged.
- The Visual Studio Code theme is unchanged from 1.3.0.

## 1.3.0

- Function-call parentheses and brackets now remain neutral instead of inheriting the function color in PHP, Python, Java, and other grammars that use the broad `meta.function-call` scope.
- Semantic tokens with the standard `modification` modifier now gain an underline without changing their foreground color.
- Invariant Highlighter and Invariant Complete are now available as optional companion extensions.

## 1.2.0

- Markdown, HTML, XML, YAML and shell scripts now carry explicit colors across the editor ports. Markdown headings are green and bold italic; formatting, list, quote, code and table markers are pink; link text is cyan, destinations are parameter blue, and reference labels are pink. Tag names read as keywords with neutral brackets, attribute names are green, entity references and YAML anchors are pale blue, and here-document delimiters are orange.

## 1.1.0

- Python modules and packages now use the identifier foreground instead of the cyan namespace color, matching how IntelliJ renders them. Both the `namespace` and `module` semantic token names emitted by Python language servers are covered.
- Workbench surfaces outside the editor — activity bar, side bar, status bar, title bar, panels, tabs, lists, menus and inputs — now match VS Code's Dark 2026 default theme. They previously fell back to the color registry's Dark+ era defaults, which painted a bright blue status bar and a light grey activity bar around the editor.
- Type parameters moved from muted rose `#bfa4a4` to bold orange `#fd971f`, so a generic slot no longer reads as a washed-out type name.
- Built-in classes and functions now use the pale blue `#bed6ff` the IntelliJ scheme gives them, so `int` and `len` read as provided by the runtime instead of as an ordinary class or function.
- The extension is also published to Open VSX, so VSCodium, Cursor, Gitpod and other Open VSX clients can install it.
- The license is declared as the SPDX identifier `EPL-2.0`, which both marketplaces now render as a proper license link.

## 1.0.0

- First stable release of Invariant for Visual Studio Code.
- Added semantic mappings for variables, parameters, types, methods, static members, and Python `self` and `cls`.
- Added the Invariant syntax palette over VS Code Dark editor surfaces.

## 0.1.0

- Initial preview release through GitHub and Visual Studio Marketplace.
