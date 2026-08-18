# Changelog

## Unreleased

- Markdown, HTML, XML, YAML and shell scripts now carry explicit colors, matching the IntelliJ scheme. Headings are green and bold italic, link text keeps the type color and destinations the parameter color, tag names read as keywords with neutral brackets, attribute names are green, entity references and YAML anchors are pale blue, and here-document delimiters are orange.

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
