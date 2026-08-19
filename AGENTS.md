# Invariant — agent bootstrap (canonical)

This file is the canonical, vendor-neutral guidance for automated contributors.
Public README files describe the products for users; maintainer and agent procedures
belong here or under `.agents/context/`.

## Repository rules

- Preserve semantic identity across editor ports. Trace the real grammar scope,
  semantic token, or IntelliJ color key before changing a mapping.
- Add or update the narrowest executable contract for highlighting changes. Run the
  affected package tests and packaging task before release work.
- Name GitHub Releases `YYYY-MM-DD - Product X.Y.Z` using the ISO publication date.
  Tags remain `invariant-vX.Y.Z`, `highlighter-vX.Y.Z`, and `complete-vX.Y.Z`.
- Treat the three VS Code extensions as independent packages with independent
  manifests, changelogs, tags, releases, and workflows. Publish Complete last.

## Routing

| Task | Read first |
| --- | --- |
| Capture or replace editor screenshots | `.agents/context/screenshots.md` |
| Change or diagnose editor highlighting | `.agents/context/editor-highlighting.md` |
| Investigate a Highlighter-like IntelliJ plugin | `.agents/context/intellij-highlighter.md` |

## Verification

Run only the gates relevant to the changed package:

```sh
npm test --prefix vscode
npm ci --prefix vscode-highlighter
npm test --prefix vscode-highlighter
npm run package --prefix vscode
npm run package --prefix vscode-highlighter
npm run package --prefix vscode-complete
gradle -p jetbrains buildPlugin verifyPlugin
```

Also run `git diff --check`; validate changed XML with `xmllint --noout`.
