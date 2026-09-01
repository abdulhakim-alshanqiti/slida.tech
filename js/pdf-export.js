// pdf-export.js — vector print PDF export that matches reveal.js appearance exactly
// Uses reveal.js "print" view (reveal-print) — one .pdf-page per slide, exact theme/fonts/RTL/live blocks.

import { deckPrintDocument } from "./deck-builder.js";

/**
 * Vector/print PDF export using reveal.js's built-in print view.
 * Generates a standalone HTML document that uses `view:"print"` so
 * reveal creates one `.pdf-page` per slide with exact styling.
 * The HTML is opened in a new tab and `window.print()` is auto-called;
 * the user then chooses "Save as PDF" for a selectable-text vector PDF.
 *
 * @param {string} markdown
 * @param {string} themeCss
 * @param {string} dir - "ltr" | "rtl"
 * @param {string} lang
 * @param {string} baseName
 */
export function exportPdfPrint(markdown, themeCss, dir = "ltr", lang = "en", baseName = "slides") {
  const html = deckPrintDocument(markdown, themeCss, dir, lang, baseName);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    // Pop-up blocked — fallback to download the printable HTML
    const a = document.createElement("a");
    a.href = url;
    a.download = (baseName || "slides") + "-print.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
  try {
    win.addEventListener("load", () => {
      setTimeout(() => {
        try {
          if (win.document && win.document.readyState === "complete") {}
        } catch (_) {}
      }, 1000);
    });
  } catch (_) {}
}

// Re-export for external use (also available from deck-builder)
export { deckPrintDocument };
