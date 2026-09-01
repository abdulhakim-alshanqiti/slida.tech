// Lightweight i18n loader for slida.tech.
//
// - Loads ./i18n/<lang>.json (en.json / ar.json).
// - Exposes t(key, vars) for use anywhere in the app (alerts, prompts,
//   status text, dynamic strings).
// - Auto-applies translations to any element in the DOM tagged with
//   data-i18n / data-i18n-title / data-i18n-placeholder.
// - Flips the whole app chrome to RTL (not just the reveal.js preview,
//   which already handles its own RTL via reveal-theme.css) when Arabic
//   is active, and persists the choice in localStorage.

const STORAGE_KEY = "slida.tech:lang";
export const SUPPORTED_LANGS = ["en", "ar"];
const RTL_LANGS = new Set(["ar"]);
const FALLBACK_LANG = "ar";

let currentLang = FALLBACK_LANG;
let dict = {};
let fallbackDict = {};
const listeners = [];

function detectInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  } catch (err) {
    /* localStorage unavailable — ignore */
  }
  return FALLBACK_LANG;
}

async function loadDict(lang) {
  const res = await fetch(`./i18n/${lang}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${lang}.json (${res.status})`);
  return res.json();
}

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** Translate a dotted key, e.g. t("theme.reset"). Optionally interpolate
 * {placeholders} found in the string with values from `vars`. */
export function t(key, vars) {
  let str = get(dict, key);
  if (str == null) str = get(fallbackDict, key);
  if (str == null) return key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    });
  }
  return str;
}

export function getLang() {
  return currentLang;
}

export function isRtl() {
  return RTL_LANGS.has(currentLang);
}

function applyDom() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = isRtl() ? "rtl" : "ltr";
  document.title = t("app.title");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.getAttribute("data-i18n-title"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
}

/** Register a callback fired after every language switch (initial load and
 * subsequent setLang calls) — e.g. so app.js/editor.js can refresh dynamic
 * content that data-i18n attributes don't cover. */
export function onChange(fn) {
  listeners.push(fn);
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn(currentLang);
    } catch (err) {
      /* a listener error shouldn't break the language switch */
    }
  });
}

export async function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = FALLBACK_LANG;
  currentLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (err) {
    /* ignore */
  }
  dict =
    lang === FALLBACK_LANG
      ? fallbackDict
      : await loadDict(lang).catch(() => fallbackDict);
  applyDom();
  notify();
}

async function initI18n() {
  fallbackDict = await loadDict(FALLBACK_LANG).catch(() => ({}));
  const initial = detectInitialLang();
  currentLang = initial;
  dict =
    initial === FALLBACK_LANG
      ? fallbackDict
      : await loadDict(initial).catch(() => fallbackDict);
  applyDom();
  notify();
}

// Kick off loading immediately on import. Other modules await this before
// using t() for anything the user will see at startup.
export const i18nReady = initI18n();
