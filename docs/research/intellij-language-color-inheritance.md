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

## A scheme cannot redirect inheritance

`baseAttributes` in an `.icls` file can reset a key, but it cannot redirect one. The
fallback of every key is fixed in IDE source by
`TextAttributesKey.createTextAttributesKey(name, fallback)`. Write a different base and the
IDE ignores it, then rewrites the entry to the declared fallback or drops it the next time
it saves the scheme.

Three states, which are easy to confuse:

| Form | Effect |
|---|---|
| No entry at all | whatever the parent scheme sets for that key wins |
| `baseAttributes` naming the declared fallback | clears the parent's value and drops the key to its fallback |
| Explicit `<value>` block | sets the colour outright |

The middle form is why `PY.STRING.B` needs an entry despite falling back to `DEFAULT_STRING`
anyway: Darcula colours byte strings separately, we inherit that from our Darcula parent, and
only an entry clears it.

This invalidates the obvious strategy of pointing a key at whichever semantic base we want.
Where a key's declared fallback already carries the intended colour, inheriting is correct.
Where it does not, the colour has to be spelled out, and `check.mjs` enforces that a key is
expressed one way or the other.

Fallbacks that surprised us, read from JetBrains source:

| Key | Declared fallback | Consequence |
|---|---|---|
| `DEFAULT_CLASS_REFERENCE` | `DEFAULT_IDENTIFIER`, not `DEFAULT_CLASS_NAME` | class references render neutral unless pinned |
| `DEFAULT_PREDEFINED_SYMBOL` | `DEFAULT_IDENTIFIER`, not `DEFAULT_KEYWORD` | reserved names render neutral unless pinned |
| `PY.SELF_PARAMETER` | `DEFAULT_PARAMETER` | `self`/`cls` render parameter blue unless pinned |
| `PY.TYPE_PARAMETER` | `DEFAULT_PARAMETER`, not `TYPE_PARAMETER_NAME_ATTRIBUTES` | moot: no annotator applies the key, so nothing renders it either way |
| `PY.ANNOTATION` | `DEFAULT_IDENTIFIER` | type hints are neutral, and cannot be made to follow class references |
| `KOTLIN_ARROW` | `PARENTHESIS` | pinned explicitly for this reason |
| `KOTLIN_COLON`, `KOTLIN_QUEST`, `KOTLIN_EXCLEXCL`, `KOTLIN_DYNAMIC_FUNCTION_CALL`, `KOTLIN_DYNAMIC_PROPERTY_CALL`, `KOTLIN_VARIABLE_AS_FUNCTION`, `KOTLIN_VARIABLE_AS_FUNCTION_LIKE` | none declared | render unstyled unless pinned |

`CSS.IDENT` claims `DEFAULT_TAG`. CSS support is not part of IntelliJ Community, so the
declared fallback cannot be verified from source and the entry is left unasserted.

## Canonical generic mapping

Java remains the reference vocabulary. The table below is the intended semantic result, not
a set of inheritance instructions: each key reaches its colour either through a declared
fallback that already carries it, or through an explicit value.

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

Java's constructor call and declaration keys already fall back to `DEFAULT_FUNCTION_CALL` and
`DEFAULT_FUNCTION_DECLARATION`. They are intentionally omitted, so both use concrete function
green `#a7ec21`.

Decision: `DEFAULT_GLOBAL_VARIABLE` uses ordinary-variable styling: warm neutral `#cfbfad`, plain. Java has no highlighting key which inherits this generic concept.

Decision: `DEFAULT_CONSTANT` retains its existing warm-neutral `#cfbfad`, italic styling. Java has no highlighting key which inherits this generic concept.

Kotlin's combined function-literal braces-and-arrow key is intentionally transparent. `KOTLIN_ARROW` explicitly uses the identifier foreground `#cfbfad`, matching Java's plain lambda arrow, while the braces retain their normal `DEFAULT_BRACES` styling. This is deliberately explicit because `KOTLIN_ARROW` declares its fallback as `PARENTHESIS`, so an inherited mapping never reaches it. IntelliJ IDEA 2026.2 emits no dedicated editor-color key for Java's `JavaTokenType.ARROW`.

## Existing language-specific entries

Keys whose declared fallback already carries the intended colour are left to inherit it:
generic locals, globals, instance fields and labels, Java constructors, Java's static-method and
annotation-attribute aliases, and Python type annotations. Kotlin operator punctuation, dynamic
calls and callable variables, Python `self` and type parameters, and generic class references and
predefined symbols are pinned to explicit values instead, because their declared fallbacks carry
a different colour or none at all. Markdown emphasis and headings carry structure through weight
and keep the identifier foreground, so prose never spends a color the code palette needs. The
remaining language-specific values are intentional differences or transparent overlays: Bash
command categories, CSS selector/function/property categories, Kotlin named-argument and
smart-cast contexts, Python built-ins and predefined names, and regular-expression match
backgrounds.

For Python, type annotations fall back to `DEFAULT_IDENTIFIER` and are left to do so, which is why a type hint reads as neutral text. Python 3.12 type parameters fall back to `DEFAULT_PARAMETER` rather than Java's `TYPE_PARAMETER_NAME_ATTRIBUTES`, so they are pinned to the type-parameter orange explicitly. The plugin's remaining syntax, function, class, parameter, local-variable, decorator, and punctuation keys already fall back to the corresponding Language Defaults.

JavaScript's bundled Darcula fragment overrides `JS.LOCAL_VARIABLE`,
`JS.GLOBAL_VARIABLE`, and `JS.INSTANCE_MEMBER_FUNCTION`. IntelliJ source declares their
fallbacks as `DEFAULT_LOCAL_VARIABLE`, `DEFAULT_GLOBAL_VARIABLE`, and
`DEFAULT_INSTANCE_METHOD`, respectively. Invariant resets each key with that exact declared
`baseAttributes` value, clearing the parent override without trying to redirect inheritance.
Locals and globals therefore render warm neutral, while resolved instance methods render green.
`JS.REGEXP` likewise resets to its declared `DEFAULT_STRING` fallback, clearing Darcula's
separate regular-expression color so JavaScript regex literals match the string identity.
When a reference cannot resolve because its library is missing, the JavaScript highlighter may
guess a variable or member category instead; a color scheme cannot recover the missing identity.

Known debt: pale blue `#bed6ff` carries two meanings. It marks signature-only methods
(`ABSTRACT_METHOD_ATTRIBUTES`, `INHERITED_METHOD_ATTRIBUTES`) and also runtime built-ins
(`PY.BUILTIN_NAME`, `BASH.EXTERNAL_COMMAND`, `CSS.FUNCTION`), and the Visual Studio Code and
Neovim ports now mirror that so the three stay consistent. This breaks the one-colour
one-meaning rule the palette otherwise keeps. Accepted deliberately rather than overlooked:
separating the two needs a new palette entry and a pass over every port, and the collision
is tolerable until then. Do not "fix" it in one port alone.

Decision: `PY.BUILTIN_NAME` retains its explicit pale-blue `#bed6ff` foreground. This intentionally overrides the plugin's `DEFAULT_PREDEFINED_SYMBOL` fallback because Python groups built-in functions and types under one color key.

Decision: `PY.PREDEFINED_DEFINITION` remains green `#a7ec21`, italic, distinguishing Python special-name definitions such as `__init__` from ordinary function declarations.

Finding: there is no module or package color key for Python, and no generic Language Default for the concept. `PyHighlighter` in `python/python-syntax-core` registers keywords, strings, numbers, punctuation, comments, decorators, class and function definitions, calls, parameters, built-in and predefined names, annotations, local variables, and type parameters; `PythonColorsPage` in `python/python-syntax` exposes exactly that set. Module references in `import os` or in an `os.path` qualifier therefore fall through to the identifier foreground. Inside a type annotation they are not separable even in principle: `PyFunctionHighlightingAnnotator` traverses every leaf of the annotation expression and merges adjacent ranges, so the module qualifier and the class it qualifies share one `PY.ANNOTATION` range.

Decision: the Visual Studio Code and Neovim ports pin Python modules to the identifier foreground rather than introducing a distinct module identity that IntelliJ cannot reproduce. Both would otherwise default to a type-like color — the `namespace` semantic token in Visual Studio Code, the `@module` capture in Neovim. Revisit if the plugin ever adds a module key.

Decision: `PY.PREDEFINED_DEFINITION` is green `#a7ec21` plain and `PY.PREDEFINED_USAGE` is neutral `#cfbfad` plain, neither italic. This deliberately gives up the rule that a symbol keeps one foreground everywhere, in exchange for the three ports agreeing.

Nothing outside IntelliJ reports a special name. Visual Studio Code's Pylance emits `__init__` as an ordinary `method` and `obj.__doc__` as a `property`, so they land on green and neutral with no italic available; Neovim resolves the same two through `@lsp.type.method` and `@lsp.type.property`. The bundled MagicPython grammar does carry `support.function.magic.python` and `support.variable.magic.python`, but semantic tokens cover those ranges and win, so a rule on them would be dead for anyone running Pylance. Matching IntelliJ to the other two is therefore the only way to make the ports agree without a mechanism that quietly does nothing.

`PY.PREDEFINED_USAGE` is pinned rather than left to inherit, because its declared fallback is `DEFAULT_PREDEFINED_SYMBOL`, which carries the reserved-name pink.

Captures, smart casts, backing fields, dynamic calls, package-level declarations, extension members, named arguments, SQL correlation, and similar context are also plugin-specific. They should keep the base foreground identity and add only a sparse effect or font modifier where the plugin permits it.

## Ceiling: Python type hints cannot be coloured compositionally

No scheme can give a Python annotation internal structure. The limit is upstream, in
`PyFunctionHighlightingAnnotator.MyVisitor.highlightAnnotationValue`
(`python/python-psi-impl/src/com/jetbrains/python/validation/`, IntelliJ IDEA 2026.2):
`visitPyAnnotation` walks every leaf of the annotation expression, keeps anything that is
not a comment, whitespace or empty range, merges adjacent leaves into contiguous runs, and
paints each run `PY_ANNOTATION`. Brackets, dots and commas are leaves like any other, so
subscript punctuation takes the annotation foreground rather than the punctuation colour.
The colour-settings preview states the same thing outright: `List[<builtin>str</builtin>]`
sits inside one annotation span, and a type parameter reads as `<typeParam>T</typeParam>`
where it is declared but `<annotation>T</annotation>` where it is used as a hint.

Two consequences we cannot style around, both observed in the editor. Subscript brackets,
commas and dots take the annotation foreground: in `x: dict[str, int]` the three names are
built-in pale blue while `[`, `,` and `]` are neutral. And a type parameter has no identity
to keep — `PY.TYPE_PARAMETER` is a dead key. No file in
`python/python-psi-impl/src/com/jetbrains/python/validation` on branch `262` applies it;
`PyTypeParameterListAnnotatorVisitor` only reports duplicate names and illegal bounds as
errors. It is registered in `PythonColorsPage` and tagged in that page's preview text, so
the setting appears to work while nothing in an editor ever paints it. `T` is therefore
neutral both where it is declared and where it is used.

Built-ins are the one exception, and they show the escape hatch: the annotation runs are
added with `LOW_PRIORITY_HIGHLIGHTING`, so any normal-priority annotator overrides them.
That is how `PY_BUILTIN_NAME` survives inside an annotation, confirmed in the editor —
built-in names render pale blue inside a hint whose other leaves stay neutral. An upstream
fix therefore stays small and local to that one file: exclude punctuation leaves from
`isHighlightableAnnotationLeaf`, and paint resolved type-parameter references
`PY_TYPE_PARAMETER` at normal priority.

Check any of this against a module that has an interpreter attached. These annotators
resolve names through `PyBuiltinCache`, so a Python file in a module carrying no Python SDK
paints a far bleaker picture than the real ceiling: built-ins lose their colour entirely,
and a built-in call renders in ordinary function green because `visitPyCallExpression` only
skips callees it can resolve as built-in. The scratch files under
`docs/misc/screenshot-scratches` are split per language so each gets the right SDK.

The scheme still pins `PY.TYPE_PARAMETER` to the type-parameter orange. That is inert in
IntelliJ today and kept deliberately, so the colour is already right if the key is ever
wired up. The Visual Studio Code port is unaffected: Pylance emits a `typeParameter`
semantic token, so type parameters are orange there now.

Decision: do not ship a Python annotator to work around this. That would turn a colour
scheme into a code plugin, with platform API churn and plugin verification on every IDE
release, in exchange for one highlighting nuance. Pursue it upstream instead —
[PY-65557](https://youtrack.jetbrains.com/issue/PY-65557) is open, Minor, and has no votes,
while [PY-32302](https://youtrack.jetbrains.com/issue/PY-32302) shows the same class of
request being accepted and shipped as `PyLocalVariableHighlightingAnnotator`.

## Implementation order

1. Check a key's declared fallback in IDE source before relying on it; pin an explicit value wherever that fallback carries the wrong colour.
2. Audit the bundled Darcula fragment for one language at a time and shadow only entries which interrupt the canonical mapping.
3. Start with Kotlin because its fallback graph already refers heavily to Java and Language Defaults, then JavaScript/TypeScript, Groovy, SQL, Shell, and markup/configuration languages.
4. Treat plugin-only concepts as individual user decisions; do not invent new foreground identities merely to cover every key.
