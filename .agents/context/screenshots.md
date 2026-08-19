# Editor screenshot procedure

Use real editor rendering. Keep the original lossless PNGs; generated GIFs supplement
them rather than replacing them.

## Visual Studio Code

1. Open a new VS Code window on a dedicated scratch workspace. Workspace-local
   installation, enablement, and settings may change; leave the user's normal window
   and user settings untouched.
2. Use the same source file, editor pane size, scroll position, cursor state, window
   position, and zoom for every before/after image. Capture the whole pair at exactly
   `1700x840` when updating the existing Highlighter comparisons.
3. Use `editor.fontSize: 19`; 20 makes the chosen font visibly too tall. Disable bracket
   pair colorization in every variant so it does not compete with the theme.
4. Toggle or install only the feature being demonstrated. A parameter comparison must
   use the same function in both images and include an ordinary local variable as the
   control case.
5. Capture PNG directly. Verify format and dimensions with `file` before committing;
   never rename or transcode a JPEG into PNG.
6. If the pair does not read well side by side, create an alternating GIF with a small
   `Highlighter off` / `Highlighter on` cue and commit both original PNGs too.

On macOS, Screen Recording permission belongs to the capturing process. If native
`screencapture` reports that it cannot capture the screen, use an already-authorized UI
capture surface or request that permission; filesystem sandbox escalation does not grant
Screen Recording access.

Scratch sources live in `docs/misc/screenshot-scratches/vscode/`; published captures
live in `docs/images/`.

## IntelliJ IDEA

Use a separate scratch project with the language SDK attached. IntelliJ annotators may
omit semantic colors when the project has no SDK, especially for Python built-ins.
Keep editor geometry, file, scroll position, and optional inlay-hint state identical
between comparisons. Capture hint-enabled variants separately instead of changing the
baseline image.

Before committing any editor capture, compare both members of the pair visually and
confirm that only the intended highlighting state changed.
