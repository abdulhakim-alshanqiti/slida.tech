import {
  idbGet,
  idbDelete,
  IDB_DOC_KEY,
  filesGetAll,
  filesPut,
  filesDelete,
} from "./idb.js";
import { deckDocument, fixSlideSeparators } from "./deck-builder.js";
import { createThemeManager } from "./theme.js";
import { t, i18nReady, getLang, setLang, isRtl, onChange as onLangChange } from "./i18n.js";

const iframe = document.getElementById("deck");
const dotsEl = document.getElementById("dots");
const statusEditor = document.getElementById("status-editor");
const statusPreview = document.getElementById("status-preview");
const fileListEl = document.getElementById("file-list");
const btnNewFile = document.getElementById("btn-new-file");
const btnLang = document.getElementById("btn-lang");

const LAST_FILE_KEY = "manuscript:last-file-id";

let files = []; // in-memory index of every file: {id, name, content, createdAt, updatedAt}
let currentFileId = null;
let currentMarkdown = "";
let pendingContent = null;
let slideCount = 1;
let slideIndex = 0;
let slideVerticalIndex = 0;

// True while we're programmatically loading a different file's markdown into
// the editor, so the resulting onUpdate doesn't re-debounce a render/autosave
// against the file we just switched away from (or into, before it settles).
let switchingFile = false;

const theme = createThemeManager({ onApply: () => renderDeck(currentMarkdown) });
theme.loadStoredCss();

function genId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "f-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function currentFile() {
  return files.find((f) => f.id === currentFileId) || null;
}

/* ---------- Preview rendering ---------- */

function renderDeck(markdownContent) {
  // Save the current Reveal.js position before rebuilding the iframe.
  pendingContent = { h: slideIndex, v: slideVerticalIndex };
  iframe.srcdoc = deckDocument(
    markdownContent,
    theme.getCss(),
    isRtl() ? "rtl" : "ltr",
    getLang(),
  );
}

window.addEventListener("message", (e) => {
  if (!e.data) return;

  if (e.data.type === "ready") {
    // Restore the slide position after the new Reveal.js instance initializes.
    if (pendingContent) {
      iframe.contentWindow.postMessage(
        { type: "goto", h: pendingContent.h, v: pendingContent.v },
        "*",
      );
      pendingContent = null;
    }
  }

  if (e.data.type === "state") {
    slideCount = e.data.total || 1;
    slideIndex = e.data.h || 0;
    slideVerticalIndex = e.data.v || 0;
    updateDots();
  }
});

function updateDots() {
  dotsEl.innerHTML = "";
  for (let i = 0; i < slideCount; i++) {
    const d = document.createElement("div");
    d.className = "dot" + (i === slideIndex ? " active" : "");
    d.title = String(i + 1);
    d.addEventListener("click", () => {
      iframe.contentWindow &&
        iframe.contentWindow.postMessage({ type: "goto", h: i, v: 0 }, "*");
    });
    dotsEl.appendChild(d);
  }
  statusPreview.textContent = t("status.slidePosition", {
    current: slideIndex + 1,
    total: slideCount,
  });
}

/* ---------- Editor -> preview pipeline ---------- */

let debounceTimer = null;

function updateWordCount(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  statusEditor.textContent = t("status.words", { n: words });
}

function onContentChange(newMarkdown) {
  currentMarkdown = fixSlideSeparators(newMarkdown);
  updateWordCount(currentMarkdown);
  if (switchingFile) return; // this update came from loading a file, not editing
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderDeck(currentMarkdown);
    autosave();
  }, 350);
}

// editor.js (the Tiptap module) calls this on every change.
window.onEditorMarkdownChange = onContentChange;

/* ---------- Present ---------- */

document.getElementById("btn-present").addEventListener("click", () => {
  if (iframe.requestFullscreen) iframe.requestFullscreen();
  else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
  iframe.contentWindow && iframe.contentWindow.focus();
});

/* ---------- Language switcher ---------- */

if (btnLang) {
  btnLang.addEventListener("click", () => {
    const next = getLang() === "ar" ? "en" : "ar";
    setLang(next);
  });
}

// Re-render bits of UI that data-i18n attributes don't cover on their own
// (dynamic strings already rendered into the DOM, not just static labels) —
// and rebuild the preview so its RTL/LTR alignment follows the new language.
onLangChange(() => {
  updateWordCount(currentMarkdown);
  updateDots();
  renderFileList();
  if (currentFileId) renderDeck(currentMarkdown);
});

/* ---------- Downloads ---------- */

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function baseName() {
  const f = currentFile();
  return (f ? f.name : "slides").replace(/\.md$/i, "");
}

document.getElementById("btn-md").addEventListener("click", () => {
  download(baseName() + ".md", currentMarkdown, "text/markdown");
});

document.getElementById("btn-html").addEventListener("click", () => {
  download(
    baseName() + ".html",
    deckDocument(currentMarkdown, theme.getCss(), isRtl() ? "rtl" : "ltr", getLang()),
    "text/html",
  );
});

/* ---------- Autosave (persisted in IndexedDB, survives across sessions) ---------- */

async function autosave() {
  const file = currentFile();
  if (!file) return;
  file.content = currentMarkdown;
  file.updatedAt = Date.now();
  try {
    await filesPut(file);
  } catch (err) {
    /* IndexedDB unavailable — ignore */
  }
  renderFileList();
}

/* ---------- Filesystem: file tabs, switching, create/rename/delete ---------- */

function renderFileList() {
  if (!fileListEl) return;
  fileListEl.innerHTML = "";
  files
    .slice()
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .forEach((f) => {
      const tab = document.createElement("div");
      tab.className = "file-tab" + (f.id === currentFileId ? " is-active" : "");
      tab.title = f.name;

      const name = document.createElement("span");
      name.className = "file-tab-name";
      name.textContent = f.name;
      name.addEventListener("click", () => switchToFile(f.id));
      name.addEventListener("dblclick", () => renameFile(f.id));

      const close = document.createElement("button");
      close.className = "file-tab-close";
      close.title = t("file.deleteTitle");
      close.textContent = "×";
      close.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteFile(f.id);
      });

      tab.appendChild(name);
      tab.appendChild(close);
      fileListEl.appendChild(tab);
    });
}

async function switchToFile(id) {
  if (id === currentFileId) return;

  // Flush any pending edits to the file we're leaving before switching away.
  clearTimeout(debounceTimer);
  if (currentFileId) await autosave();

  const file = files.find((f) => f.id === id);
  if (!file) return;

  currentFileId = id;
  try {
    localStorage.setItem(LAST_FILE_KEY, id);
  } catch (err) {
    /* ignore */
  }

  switchingFile = true;
  currentMarkdown = fixSlideSeparators(file.content || "");
  updateWordCount(currentMarkdown);
  if (window.setEditorMarkdown) window.setEditorMarkdown(currentMarkdown);
  switchingFile = false;

  renderDeck(currentMarkdown);
  renderFileList();
}

function nextUntitledName() {
  const used = new Set(files.map((f) => f.name));
  let n = 1;
  while (used.has(t("file.untitled", { n }))) n++;
  return t("file.untitled", { n });
}

async function newFile() {
  const file = {
    id: genId(),
    name: nextUntitledName(),
    content: t("file.newSlideContent"),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  files.push(file);
  await filesPut(file);
  await switchToFile(file.id);
}

async function renameFile(id) {
  const file = files.find((f) => f.id === id);
  if (!file) return;
  const next = window.prompt(t("file.renamePrompt"), file.name);
  if (!next || !next.trim() || next.trim() === file.name) return;
  file.name = next.trim();
  file.updatedAt = Date.now();
  await filesPut(file);
  renderFileList();
}

async function deleteFile(id) {
  if (files.length <= 1) {
    window.alert(t("file.deleteLastAlert"));
    return;
  }
  const file = files.find((f) => f.id === id);
  if (!file) return;
  if (!window.confirm(t("file.deleteConfirm", { name: file.name }))) return;

  await filesDelete(id);
  files = files.filter((f) => f.id !== id);

  if (id === currentFileId) {
    currentFileId = null; // avoid autosaving into the file we just deleted
    await switchToFile(files[0].id);
  } else {
    renderFileList();
  }
}

if (btnNewFile) {
  btnNewFile.addEventListener("click", () => newFile());
}

/* ---------- Startup ---------- */

window.liveDiagramCodePromise = fetch("./live-diagram.js", {
  cache: "no-store",
}).then((res) => res.text());

async function migrateLegacyDoc() {
  // Users who saved a single document before the filesystem existed get it
  // imported as their first file, then the old record is cleared out.
  try {
    const saved = await idbGet(IDB_DOC_KEY);
    if (saved) {
      await idbDelete(IDB_DOC_KEY);
      return saved;
    }
  } catch (err) {
    /* no saved doc yet, or IndexedDB unavailable */
  }
  return null;
}

async function loadBundledSlides() {
  const response = await fetch("./slides.md", { cache: "no-store" });
  return await response.text();
}

async function bootstrapFiles() {
  await i18nReady; // t() below needs a loaded dictionary

  files = await filesGetAll().catch(() => []);

  if (files.length === 0) {
    const legacy = await migrateLegacyDoc();
    const content = legacy != null ? legacy : await loadBundledSlides();
    const file = {
      id: genId(),
      name: legacy != null ? t("file.untitled", { n: 1 }) : "Welcome",
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    files = [file];
    await filesPut(file);
  }

  let lastId = null;
  try {
    lastId = localStorage.getItem(LAST_FILE_KEY);
  } catch (err) {
    /* ignore */
  }
  const startFile = (lastId && files.find((f) => f.id === lastId)) || files[0];

  currentFileId = startFile.id;
  currentMarkdown = fixSlideSeparators(startFile.content || "");

  return currentMarkdown;
}

// Shared promises: both this module and the Tiptap module (editor.js) await
// the same initial document / diagram source.
window.initialMarkdownPromise = bootstrapFiles();

window.initialMarkdownPromise.then(async (val) => {
  // When the app is served beside reveal-theme.css, use that file as the
  // initial theme. A previously-saved theme in localStorage always wins, so
  // user edits persist between sessions.
  if (!theme.hasStoredCss()) {
    try {
      const response = await fetch("./reveal-theme.css", { cache: "no-store" });
      if (response.ok) theme.setInitialCss(await response.text());
    } catch (err) {
      /* fall back to the built-in default theme */
    }
  }
  updateWordCount(currentMarkdown);
  renderDeck(currentMarkdown);
  renderFileList();
});
