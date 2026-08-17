# Draft comment for PY-65557

Not posted. Review and post manually at
<https://youtrack.jetbrains.com/issue/PY-65557>.

---

Two concrete cases where the current annotation highlighting loses information, both
reproducible in 2026.2 with any colour scheme.

**1. Subscript punctuation takes the annotation colour.**

```python
tags: List[str]
```

The `[` and `]` are painted `PY_ANNOTATION` along with `List`. Everywhere else in a
Python file, brackets follow the punctuation/plain-text colour. Inside an annotation they
change colour, so a scheme cannot keep punctuation visually quiet the way it is in the
surrounding code.

**2. `PY.TYPE_PARAMETER` is offered in Settings but never applied.**

```python
def make_sense[T](self, whatever: T): ...
```

`T` renders in the plain annotation colour in both positions — at its declaration in the
type-parameter list and at its use site in the annotation. Setting *Python | Type parameter*
in **Settings | Editor | Color Scheme** changes nothing anywhere.

Scanning `python/python-psi-impl/src/com/jetbrains/python/validation` on branch `262`, no
file references `PyHighlighter.PY_TYPE_PARAMETER`. `PyTypeParameterListAnnotatorVisitor`
visits `PyTypeParameterList` and `PyTypeParameter`, but only to report duplicate names and
illegal bounds as errors; it applies no `TextAttributesKey`. The key is registered in
`PythonColorsPage` as an `AttributesDescriptor` and mapped as `typeParam` for the preview
text, so the settings page shows it working while no editor ever paints it.

Highlighting a `PyTypeParameter`'s name identifier with `PY_TYPE_PARAMETER` would make the
existing setting do what it says. Doing the same for references that resolve to a
`PyTypeParameter` would additionally let a type parameter keep its identity where it is used
as a hint, since a normal-priority annotation overrides the low-priority annotation wash.

**Why this looks cheap to fix.**

`PyFunctionHighlightingAnnotator.MyVisitor.highlightAnnotationValue` traverses every leaf
of the annotation expression, filters out only comments, whitespace and empty ranges,
merges adjacent leaves into contiguous runs, and paints each run `PY_ANNOTATION`.

Crucially it does so with `LOW_PRIORITY_HIGHLIGHTING`, so a normal-priority annotator
already wins — that is exactly how `PY_BUILTIN_NAME` stays visible inside an annotation
today, which is easy to confirm in the editor: in `x: dict[str, int]` the `dict`, `str` and
`int` keep the built-in colour while the brackets and comma do not. The extension mechanism
is in place; these two cases just are not using it.

That suggests both fixes are local to that one method:

- Extend `isHighlightableAnnotationLeaf` to skip punctuation leaves, so brackets, commas
  and dots fall back to their normal colour.
- Apply `PY_TYPE_PARAMETER` to a `PyTypeParameter`'s name identifier, and to references
  that resolve to one, at normal priority so they override the low-priority annotation wash.

Both are additive and neither needs a new colour key: `PY_TYPE_PARAMETER` already exists and
is already exposed in the colour-settings page, it simply is not used.

If changing the default appearance is the concern, PY-32302 seems like the precedent worth
following: it was the same class of request (a broad span hiding a narrower semantic
category), and it shipped as `PyLocalVariableHighlightingAnnotator`.

I am happy to prepare a pull request against `intellij-community` if this is something you
would accept.
