// Minimal Mustache-compatible template renderer for HTMLRenderer "render
// view" sources: these are JS source strings containing Mustache-style
// placeholders ({{key}}, {{#arrayKey}}...{{/arrayKey}} with {{.}} inside),
// which get substituted against a node's `state` before the result is run
// as executable JS. Values are escaped for safe embedding inside a
// single-quoted JS string literal (this is JS source being generated, not
// HTML), matching how existing render views like
// `question.textContent = '{{question}}';` are written.
//
// Shared by HTMLRendererNode.js (the "Run Render View" debug preview in the
// editor) and deck-builder.js (substituting state into the render view
// before handing the result to reveal.js as a live block), so both contexts
// always resolve a template identically.

function escapeForJsString(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

function lookup(view, key) {
  let value = view;
  for (const k of key.split(".")) {
    if (value === null || value === undefined) return value;
    value = value[k];
  }
  return value;
}

export function renderTemplate(template, view) {
  // Sections: {{#key}}...{{.}}...{{/key}} — key must resolve to an array.
  let rendered = (template || "").replace(
    /\{\{#([\w.]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (match, key, content) => {
      const value = lookup(view, key);
      if (Array.isArray(value)) {
        return value
          .map((item) => content.replace(/\{\{\.\}\}/g, escapeForJsString(item)))
          .join("");
      }
      return "";
    },
  );

  // Simple variables: {{key}} (dotted paths supported).
  rendered = rendered.replace(/\{\{([\w.]+)\}\}/g, (match, key) => {
    const value = lookup(view, key);
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return escapeForJsString(value);
    return JSON.stringify(value);
  });

  return rendered;
}

// Renders `renderViewSource` against `state`, preferring a globally-loaded
// Mustache (window.Mustache) if one happens to be present, falling back to
// the lightweight implementation above otherwise.
export function renderRenderView(renderViewSource, state) {
  const engine =
    (typeof window !== "undefined" && window.Mustache) || { render: renderTemplate };
  return engine.render(renderViewSource || "", state || {});
}
