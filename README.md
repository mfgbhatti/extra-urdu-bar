# Urdu Extras Bar (Discourse theme component)

Adds one toggle button to the composer toolbar. Tapping it shows/hides a
single scrollable row of 21 Urdu characters that aren't reachable from a
standard keyboard: extra hamza letters, extra diacritics, honorifics, and
verse/page marks. Tapping any character in the bar inserts it at the
current cursor position in the composer. Tapping the toggle again hides
the bar. Nothing else is changed — normal typing is untouched.

## Character set

| Group | Characters |
|---|---|
| Hamza letters | ؤ ۂ ۓ أ |
| Extra diacritics | ◌ٖ ◌ٗ ◌ٔ |
| Honorifics | ﷺ ﷻ ﷽ ◌ؐ ◌ؑ ◌ؓ ◌ؒ ◌ؔ |
| Verse / page marks | ؎ ؏ ؁ ؃ ؀ ؂ |

(Diacritics are shown on a dotted circle placeholder ◌ so the button is
readable — only the diacritic itself is inserted.)

## Install

1. In Discourse admin: **Customize > Themes > Install > From a git repository**
   (or **From an archive** if you zip this folder), pointing at wherever
   you host this component.
2. Add the component to whichever theme(s) your forum uses.

## How it works

- `javascripts/discourse/api-initializers/extra-urdu-bar.js` adds a
  toolbar button via Discourse's `onToolbarCreate` API. On click it either
  removes an existing bar (toggle off) or builds and inserts a bar of 21
  buttons right below the composer's toolbar (toggle on).
- Clicking a bar button inserts that character at the textarea's current
  cursor position, using the native `HTMLTextAreaElement` value setter +
  a dispatched `input` event so Discourse's Ember-based composer state
  picks up the change (a plain `.value =` assignment would not).
- `common/common.scss` styles the bar to match the current theme's colour
  variables, and makes it horizontally scrollable for narrow/mobile
  screens.

## Notes / things to verify on your instance

- This targets `.d-editor` / `textarea.d-editor-input`, which is the
  standard composer textarea class in current Discourse. If your site
  runs a heavily customized composer, double check that selector still
  matches.
- Only one bar is created against the currently open composer. Discourse
  normally only has one composer open at a time, so this should be safe,
  but if your setup allows multiple simultaneous composers this may need
  a small adjustment to scope the toggle per-instance.
- The rich-text (WYSIWYG) composer mode is not covered — this assumes the
  default markdown textarea composer.
