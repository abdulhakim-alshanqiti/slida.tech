import { DEFAULT_THEME_CSS } from "./default-theme.js";
import { t } from "./i18n.js";

const THEME_STORAGE_KEY = "manuscript:theme-css";

/**
 * Wires up the "Theme CSS" modal (edit / import / export / reset) and keeps
 * track of the current theme CSS. Calls `onApply(css)` whenever the theme
 * changes and should be reflected in the preview.
 */
export function createThemeManager({ onApply }) {
  let themeCss = DEFAULT_THEME_CSS;
  let debounceTimer = null;

  const modal = document.getElementById("theme-modal");
  const editor = document.getElementById("theme-editor");
  const status = document.getElementById("theme-status");
  const fileInput = document.getElementById("theme-file-input");

  function updateStatus(text) {
    if (status) status.textContent = text;
  }

  function apply(css) {
    themeCss = css;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeCss);
    } catch (err) {
      /* localStorage unavailable — ignore */
    }
    updateStatus(t("theme.statusUpdated"));
    onApply(themeCss);
  }

  function open() {
    editor.value = themeCss;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => editor.focus(), 0);
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function download() {
    const blob = new Blob([themeCss], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reveal-theme.css";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  editor.addEventListener("input", (e) => {
    themeCss = e.target.value;
    updateStatus(t("theme.statusEditing"));
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => apply(themeCss), 250);
  });

  document.getElementById("btn-theme").addEventListener("click", open);
  document.getElementById("btn-theme-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target.id === "theme-modal") close();
  });

  document.getElementById("btn-theme-reset").addEventListener("click", () => {
    editor.value = DEFAULT_THEME_CSS;
    apply(DEFAULT_THEME_CSS);
  });

  document
    .getElementById("btn-theme-download")
    .addEventListener("click", download);

  document.getElementById("btn-theme-import").addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const css = await file.text();
      editor.value = css;
      apply(css);
      updateStatus(t("theme.statusReplaced", { name: file.name }));
    } catch (err) {
      updateStatus(t("theme.statusReadError"));
    } finally {
      e.target.value = "";
    }
  });

  editor.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      download();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      el.setRangeText("  ", start, end, "end");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (e.key === "Escape") close();
  });

  return {
    /** Current theme CSS, for building the deck document. */
    getCss: () => themeCss,

    /**
     * Adopt a CSS value during startup (e.g. the bundled reveal-theme.css)
     * without persisting it or firing onApply — the caller renders the deck
     * itself once the initial document is ready.
     */
    setInitialCss(css) {
      themeCss = css;
    },

    /** Whether the user has a previously saved theme in localStorage. */
    hasStoredCss() {
      try {
        return !!localStorage.getItem(THEME_STORAGE_KEY);
      } catch (err) {
        return false;
      }
    },

    /** Loads a previously saved theme from localStorage, if any. */
    loadStoredCss() {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved) themeCss = saved;
      } catch (err) {
        /* ignore */
      }
    },
  };
}
