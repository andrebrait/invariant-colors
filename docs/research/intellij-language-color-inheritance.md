# IntelliJ editor-color inheritance across languages

Scope: editor color scheme attributes only. Code style, formatting, import layout, and inspection-profile configuration are out of scope.

## Sources and baseline

- IntelliJ IDEA 2026.2 source tag `1822802cd32c2268237bc2734326fc8d51cf1f67`.
- The installed IntelliJ IDEA Ultimate 2026.2.0.1 build `262.8665.337` and its bundled plugin resources.
- JetBrains' generic [`DefaultLanguageHighlighterColors`](https://github.com/JetBrains/intellij-community/blob/1822802cd32c2268237bc2734326fc8d51cf1f67/platform/core-api/src/com/intellij/openapi/editor/DefaultLanguageHighlighterColors.java).
- JetBrains' [`IslandSchemeDark.xml`](https://github.com/JetBrains/intellij-community/blob/1822802cd32c2268237bc2734326fc8d51cf1f67/platform/platform-resources/src/themes/islands/IslandSchemeDark.xml).

## Finding: Islands Dark is a hybrid

Islands Dark defines 33 `DEFAULT_*` Language Defaults directly. Only `DEFAULT_FUNCTION_CALL` uses `baseAttributes`; it inherits `DEFAULT_IDENTIFIER`. Important semantic defaults such as parameter, local variable, global variable, class name, interface name, label, and predefined symbol are absent and continue through Darcula or platform fallbacks.

The bundled language plugins then contribute Darcula-specific fragments which Islands Dark receives through its Darcula parent. The installed 2026.2 build contains:

- Kotlin: `Kotlin/lib/intellij.kotlin.base.resources.jar!/colorScheme/Darcula_Kotlin.xml`
- Groovy: `Groovy/lib/Groovy.jar!/colorSchemes/GroovyDarcula.xml`
- JavaScript and TypeScript: `javascript-plugin/lib/modules/intellij.javascript.backend.jar!/colorSchemes/Darcula.xml`
- SQL: `DatabaseTools/lib/modules/intellij.database.sql.core.impl.jar!/colorSchemes/SqlDarcula.xml`
- Shell: `sh-plugin/lib/intellij.sh.core.jar!/colors/ShDarcula.xml`

Those fragments explicitly override concepts including JavaScript local/global variables and functions, Kotlin package functions and type parameters, Groovy static properties, SQL outer-query columns, and shell external commands. Consequently, setting Language Defaults is necessary but not sufficient for cross-language consistency.

## Canonical generic mapping

Java remains the reference vocabulary. The generic layer should carry every relationship it can express:

| Semantic identity | Language Default | Invariant result |
|---|---|---|
| Identifier/local/global variable | `DEFAULT_IDENTIFIER`, `DEFAULT_LOCAL_VARIABLE`, `DEFAULT_GLOBAL_VARIABLE` | warm neutral `#cfbfad` |
| Instance field/property | `DEFAULT_INSTANCE_FIELD` | warm neutral `#cfbfad` |
| Parameter | `DEFAULT_PARAMETER` | blue `#79abff` |
| Class/interface/type reference | `DEFAULT_CLASS_NAME`, `DEFAULT_INTERFACE_NAME`, `DEFAULT_CLASS_REFERENCE` | cyan `#52e3f6` |
| Function declaration/call/instance method | `DEFAULT_FUNCTION_DECLARATION`, `DEFAULT_FUNCTION_CALL`, `DEFAULT_INSTANCE_METHOD` | concrete green `#a7ec21` |
| Static field | `DEFAULT_STATIC_FIELD` | warm neutral `#cfbfad`, italic |
| Static method | `DEFAULT_STATIC_METHOD` | green `#a7ec21`, italic |
| Constant | `DEFAULT_CONSTANT` | warm neutral `#cfbfad`, italic |
| Reserved/predefined symbol | `DEFAULT_PREDEFINED_SYMBOL` | reserved-name pink family |
| Keyword | `DEFAULT_KEYWORD` | pink `#ff007f`, bold |
| Comments | `DEFAULT_LINE_COMMENT`, `DEFAULT_BLOCK_COMMENT`, `DEFAULT_DOC_COMMENT` | white `#ffffff` |
| String/number | `DEFAULT_STRING`, `DEFAULT_NUMBER` | yellow `#ece47e` / purple `#c48cff` |
| Reassigned value | `DEFAULT_REASSIGNED_LOCAL_VARIABLE`, `DEFAULT_REASSIGNED_PARAMETER` | retain identity; add the established reassignment effect |

## Where generic defaults cannot carry the Java model

The generic API has no abstract/signature-only function key. Java exposes `ABSTRACT_METHOD_ATTRIBUTES` and `INHERITED_METHOD_ATTRIBUTES`, but other languages can preserve the pale-blue distinction only if their plugin emits an equivalent language-specific key.

Decision: `DEFAULT_FUNCTION_CALL`, `DEFAULT_FUNCTION_DECLARATION`, and `DEFAULT_INSTANCE_METHOD` use concrete green `#a7ec21`. Abstract and inherited methods remain pale blue only where a language exposes a more specific semantic key.

`DEFAULT_FUNCTION_CALL` keeps an explicit green foreground because IntelliJ's built-in fallback is `DEFAULT_IDENTIFIER`; relying on a scheme-level `baseAttributes` replacement did not survive import as the intended relationship.

Decision: `DEFAULT_GLOBAL_VARIABLE` uses ordinary-variable styling: warm neutral `#cfbfad`, plain. Java has no highlighting key which inherits this generic concept.

Decision: `DEFAULT_CONSTANT` retains its existing warm-neutral `#cfbfad`, italic styling. Java has no highlighting key which inherits this generic concept.

Kotlin's combined function-literal braces-and-arrow key is intentionally transparent. `KOTLIN_ARROW` inherits `DEFAULT_IDENTIFIER`, matching Java's plain lambda arrow, while the braces retain their normal `DEFAULT_BRACES` styling. IntelliJ IDEA 2026.2 emits no dedicated editor-color key for Java's `JavaTokenType.ARROW`.

## Existing language-specific entries

Exact duplicates now inherit their semantic base: CSS element selectors, Kotlin operator punctuation, dynamic calls and properties, Kotlin callable variables, and Python `self`. Empty Markdown emphasis/list entries and Java's redundant annotation-name alias were removed because omission produces the same effective style. The remaining language-specific values are intentional differences or transparent overlays: Bash command categories, CSS selector/function/property categories, Kotlin named-argument and smart-cast contexts, Python built-ins and predefined names, and regular-expression match backgrounds.

For Python, type annotations inherit `DEFAULT_CLASS_REFERENCE`, and Python 3.12 type parameters inherit Java's `TYPE_PARAMETER_NAME_ATTRIBUTES`. The plugin's remaining syntax, function, class, parameter, local-variable, decorator, and punctuation keys already fall back to the corresponding Language Defaults.

Decision: `PY.BUILTIN_NAME` retains its explicit pale-blue `#bed6ff` foreground. This intentionally overrides the plugin's `DEFAULT_PREDEFINED_SYMBOL` fallback because Python groups built-in functions and types under one color key.

Decision: `PY.PREDEFINED_DEFINITION` remains green `#a7ec21`, italic, distinguishing Python special-name definitions such as `__init__` from ordinary function declarations.

Decision: `PY.PREDEFINED_USAGE` is italic-only. Python's separate method-call highlighting supplies green for calls such as `obj.__iter__()`, while field usages such as `obj.__doc__` retain identifier-neutral foreground and gain italics.

Captures, smart casts, backing fields, dynamic calls, package-level declarations, extension members, named arguments, SQL correlation, and similar context are also plugin-specific. They should keep the base foreground identity and add only a sparse effect or font modifier where the plugin permits it.

## Implementation order

1. Complete the generic Language Defaults aliases, especially class references, instance methods, locals/globals, and predefined symbols.
2. Audit the bundled Darcula fragment for one language at a time and shadow only entries which interrupt the canonical mapping.
3. Start with Kotlin because its fallback graph already refers heavily to Java and Language Defaults, then JavaScript/TypeScript, Groovy, SQL, Shell, and markup/configuration languages.
4. Treat plugin-only concepts as individual user decisions; do not invent new foreground identities merely to cover every key.
