# IntelliJ Highlighter follow-up

Status: queued after the 1.3.0 release and repository-guidance cleanup.

## Goal

Investigate a separate IntelliJ plugin that complements the platform highlighters where
color schemes cannot express Invariant's semantic model. The target is analogous to
Invariant Highlighter for VS Code: add missing classifications or modifiers while
preserving built-in syntax colors, inspections, navigation, and diagnostics.

## Questions to answer before prototyping

1. Which supported IntelliJ APIs can layer semantic attributes without replacing the
   existing foreground or inspection effects?
2. Can PSI, UAST, or language-specific analysis reliably identify parameter uses,
   reassigned symbols, Python type parameters, and the other documented concessions?
3. What invalidation boundary keeps edits incremental: PSI element, callable, file, or
   daemon highlighting pass?
4. Which gaps are cross-language and which require language-specific adapters?
5. Can one narrow prototype survive Plugin Verifier across the repository's supported
   IntelliJ range without internal APIs?

Start with research against current JetBrains SDK sources. Prototype one high-value gap
only after the layering and invalidation model is proven; do not turn the color-scheme
plugin into the runtime extension until that boundary is understood.
