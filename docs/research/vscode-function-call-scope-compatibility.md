# VS Code function-call scope compatibility

## Conclusion

Replacing the broad TextMate selector `meta.function-call` with
`meta.function-call.generic.python` is correct for PHP, Python, Java, and
JavaScript/TypeScript in the installed VS Code 1.133 setup. It removes the call
container's green foreground from punctuation without removing green from the callee name.
Java is also confirmed visually in the editor.

This is not universal: ordinary user-defined R calls lose green because the bundled R
grammar gives their callee only the enclosing `meta.function-call.r` scope. R needs its
own narrow name solution before it can match the other languages.

## Evidence matrix

| Language | Callee-name source | Call punctuation source | Result |
|---|---|---|---|
| PHP | `entity.name.function.php`; built-ins use `support.function.*.php` | `punctuation.definition.arguments.*.php` inside `meta.function-call.php`; array access can share that parent | Name stays green; `()` and `[]` stop inheriting green. User-confirmed. |
| Python | The bundled grammar's `meta.function-call.generic.python` is a match for the identifier only; the enclosing call is `meta.function-call.python` | `punctuation.definition.arguments.*.python` belongs to the enclosing call | The replacement preserves exactly the otherwise-unscoped ordinary callee name and releases punctuation. User-confirmed. |
| Java | `entity.name.function.java`; installed JDT LS 1.59 also emits the standard `method` semantic token for resolved method names | `punctuation.definition.parameters.*.java`; JDT LS visits the invocation name, not the parentheses | Name stays green from either layer; punctuation becomes neutral. User-confirmed. |
| JavaScript / TypeScript | `entity.name.function.js` / `.ts`; VS Code's TS service also emits standard `function` and `method` semantic tokens | Parentheses are separate round-brace scopes, not callee-name tokens | Names stay green; punctuation remains neutral. |
| R | Package functions get `support.function.r`, but an ordinary call such as `my_fun()` has only `meta.function-call.r` around the callee and arguments | `punctuation.definition.arguments.*.r` within the same parent | Built-ins stay green, but ordinary user-defined callees become neutral. Known exception. |

The grammar claims above come from the installed files and their matching VS Code 1.133
sources: [PHP](https://github.com/microsoft/vscode/blob/1.133.0/extensions/php/syntaxes/php.tmLanguage.json),
[Python](https://github.com/microsoft/vscode/blob/1.133.0/extensions/python/syntaxes/MagicPython.tmLanguage.json),
[JavaScript](https://github.com/microsoft/vscode/blob/1.133.0/extensions/javascript/syntaxes/JavaScript.tmLanguage.json),
[TypeScript](https://github.com/microsoft/vscode/blob/1.133.0/extensions/typescript-basics/syntaxes/TypeScript.tmLanguage.json), and
[R](https://github.com/microsoft/vscode/blob/1.133.0/extensions/r/syntaxes/r.tmLanguage.json).
Java was checked against Red Hat Java 1.55's installed
`language-support/java/java.tmLanguage.json` and JDT LS
`org.eclipse.jdt.ls.core_1.59.0.202606241329.jar`; the upstream JDT LS visitor resolves a
`MethodInvocation` through its name and classifies method bindings as `method`
([visitor](https://github.com/eclipse-jdtls/eclipse.jdt.ls/blob/main/org.eclipse.jdt.ls.core/src/org/eclipse/jdt/ls/core/internal/semantictokens/SemanticTokensVisitor.java),
[token type](https://github.com/eclipse-jdtls/eclipse.jdt.ls/blob/main/org.eclipse.jdt.ls.core/src/org/eclipse/jdt/ls/core/internal/semantictokens/TokenType.java)).

## General rule and limit

TextMate scopes are nested; a theme rule for a parent colors all descendants unless a
more specific rule wins. That is why bare `meta.function-call` colored punctuation
([VS Code syntax-highlighting guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#textmate-tokens-and-scopes)).

The change is safe for a language when its callee has a leaf scope already covered by
Invariant (`entity.name.function`, `support.function`, or a similarly targeted scope),
or when its language service emits `function`/`method`. Invariant maps both standard
semantic types to green, and VS Code applies semantic highlighting over TextMate
highlighting ([VS Code semantic-highlighting guide](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide)).

It is not safe to infer support for every grammar from the `meta.function-call.*`
prefix. A language like R may use that parent as its only call-name classification, and
semantic providers vary by extension, configuration, and project readiness. Validate a
new language with `Developer: Inspect Editor Tokens and Scopes`; the desired result is a
callee-specific green rule or `function`/`method` semantic token on the name, and no such
rule on its punctuation.
