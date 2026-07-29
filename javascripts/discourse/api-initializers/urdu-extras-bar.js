import { apiInitializer } from "discourse/lib/api";

// The 21 "extra" Urdu characters (hamza letters, extra diacritics,
// honorifics, verse/page marks) that don't fit anywhere else.
// `label` is what's shown on the button (diacritics get a dotted-circle
// placeholder, U+25CC, so they're visible on their own).
// `char` is the actual character inserted into the composer.
const EXTRA_CHARACTERS = [
  { char: "\u0624", label: "\u0624", title: "Hamza on Waw" },
  { char: "\u06C2", label: "\u06C2", title: "Heh Goal with Hamza" },
  { char: "\u06D3", label: "\u06D3", title: "Yeh Barree with Hamza" },
  { char: "\u0623", label: "\u0623", title: "Alef with Hamza Above" },
  { char: "\u064E", label: "\u25CC\u064E", title: "zabbar" },
  { char: "\u0650", label: "\u25CC\u0650", title: "zair" },
  { char: "\u064F", label: "\u25CC\u064F", title: "paish" },
  { char: "\u0670", label: "\u25CC\u0670", title: "khadi zabbar" },
  { char: "\u0656", label: "\u25CC\u0656", title: "khadi zair" },
  { char: "\u064D", label: "\u25CC\u064D", title: "double zair" },
  { char: "\u064B", label: "\u25CC\u064B", title: "double zabbar" },
  { char: "\u0651", label: "\u25CC\u0651", title: "shadd" },
  { char: "\u0657", label: "\u25CC\u0657", title: "Inverted Damma" },
  { char: "\u0654", label: "\u25CC\u0654", title: "Hamza Above" },
  { char: "\u0610", label: "\u25CC\u0610", title: "Sallallahu Alaihi Wasallam (mark)" },
  { char: "\u0611", label: "\u25CC\u0611", title: "Alaihi Assalam (mark)" },
  { char: "\u0613", label: "\u25CC\u0613", title: "Radi Allahu Anhu (mark)" },
  { char: "\u0612", label: "\u25CC\u0612", title: "Rahmatullah Alaih (mark)" },
  { char: "\u0614", label: "\u25CC\u0614", title: "Takhallus (mark)" },
  { char: "\uFDFA", label: "\uFDFA", title: "Sallallahu Alaihi Wasallam (ligature)" },
  { char: "\uFDFB", label: "\uFDFB", title: "Jalla Jalaluhu (ligature)" },
  { char: "\uFDFD", label: "\uFDFD", title: "Bismillah (ligature)" },

];

const BAR_CLASS = "extra-urdu-bar";
const TOGGLE_ACTIVE_CLASS = "extra-urdu-bar-active";

// Insert `char` at the current cursor position of `textarea`, in a way
// that Discourse's Ember bindings actually notice (plain `.value =`
// assignment does not trigger the framework's reactive update).
function insertAtCursor(textarea, char) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const newValue =
    textarea.value.slice(0, start) + char + textarea.value.slice(end);

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set;
  nativeInputValueSetter.call(textarea, newValue);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  const newCursor = start + char.length;
  textarea.focus();
  textarea.setSelectionRange(newCursor, newCursor);
}

function buildBar(textarea) {
  const bar = document.createElement("div");
  bar.className = BAR_CLASS;

  EXTRA_CHARACTERS.forEach(({ char, label, title }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "extra-urdu-bar-btn";
    btn.textContent = label;
    btn.title = title;
    btn.setAttribute("aria-label", title);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      insertAtCursor(textarea, char);
    });
    bar.appendChild(btn);
  });

  return bar;
}

export default apiInitializer("1.8.0", (api) => {
  api.onToolbarCreate((toolbar) => {
    toolbar.addButton({
      id: "urdu-extras-toggle",
      group: "extras",
      icon: "language",
      title: "urdu_extras_bar.toggle_title",
      action: () => {
        const editor = document.querySelector(".d-editor");
        if (!editor) return;

        const existingBar = editor.querySelector(`.${BAR_CLASS}`);
        if (existingBar) {
          existingBar.remove();
          editor.classList.remove(TOGGLE_ACTIVE_CLASS);
          return;
        }

        const textarea = editor.querySelector("textarea.d-editor-input");
        if (!textarea) return;

        const bar = buildBar(textarea);

        // Insert as a sibling inside .d-editor-textarea-wrapper (a column
        // flex container), right after the toolbar's wrapper. Do NOT
        // insert inside .d-editor-button-bar__wrap itself — that wrapper
        // has overflow: clip and is sized to fit only the toolbar row,
        // so anything appended inside it gets clipped/overlapped.
        const wrapEl =
          editor.querySelector(".d-editor-button-bar__wrap") ||
          editor.querySelector(".d-editor-button-bar");
        const textareaWrapper = editor.querySelector(
          ".d-editor-textarea-wrapper"
        );

        if (textareaWrapper && wrapEl) {
          textareaWrapper.insertBefore(bar, wrapEl.nextSibling);
        } else {
          editor.insertBefore(bar, editor.firstChild);
        }

        editor.classList.add(TOGGLE_ACTIVE_CLASS);
      },
    });
  });
});
