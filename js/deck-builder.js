// Builds the standalone Reveal.js document used both for the live preview
// iframe and for the downloadable slides.html export. Markdown "live" code
// fences are pulled out and re-run inside the deck via the small LiveKit
// runtime embedded below (it executes inside the iframe's own document, so
// it stays a plain string rather than a real ES module).

import { renderRenderView } from "./render-template.js";

function extractLiveBlocks(source) {
  const liveSources = [];

  const consume = (code) => {
    const idx = liveSources.length;
    liveSources.push(code);
    return (
      '\n\n<div class="live-block-slot" data-live-index="' +
      idx +
      '"></div>\n\n'
    );
  };

  // Plain ```live fences: kept for backward compatibility with any
  // hand-authored or previously-saved live blocks. Run as-is.
  let transformed = source.replace(
    /```live\r?\n([\s\S]*?)```/g,
    (match, code) => consume(code),
  );

  // ```htmlrenderer fences: the full round-tripped HTMLRenderer node
  // (configGenerator + renderView + state, see HTMLRendererNode.js). Only
  // the *rendered* view — renderView with state substituted in — is sent
  // on to reveal.js; configGenerator is editor-only and never reaches the
  // deck.
  transformed = transformed.replace(
    /```htmlrenderer\r?\n([\s\S]*?)```/g,
    (match, jsonText) => {
      let payload;
      try {
        payload = JSON.parse(jsonText);
      } catch (err) {
        return consume(
          `container.textContent = ${JSON.stringify(
            "Invalid HTML Renderer block: " + err.message,
          )};`,
        );
      }
      let rendered;
      try {
        rendered = renderRenderView(payload.renderView, payload.state);
      } catch (err) {
        rendered = `container.textContent = ${JSON.stringify(
          "Render View Error: " +
            (err && err.message ? err.message : String(err)),
        )};`;
      }
      return consume(rendered);
    },
  );

  return { transformed, liveSources };
}

/*
 * The Tiptap/markdown serializer escapes a leading "-" at the start of a line
 * (so it can't be mistaken for a list bullet), which turns our "--" sub-slide
 * marker into "\--" on export. reveal.js's vertical-separator regex expects a
 * literal "--", so an escaped marker silently fails to split — undo that one
 * specific escape here, before the markdown is used anywhere.
 */
export function fixSlideSeparators(markdown) {
  return markdown.replace(/^\\?-\\?-$/gm, "--");
}

/*
 * Direction-aware overrides for the deck, applied *after* the loaded theme
 * CSS so a presentation always aligns correctly for the app's current UI
 * language — regardless of what the theme file itself does or doesn't say
 * about direction. Only emitted for RTL; when dir is "ltr" this is empty,
 * since the base reveal.js styles (and default-theme.js) are already LTR.
 */
function directionOverrides(dir) {
  if (dir !== "rtl") return "";
  return `
    html{ direction:rtl; }

    .reveal ol, .reveal ul, .reveal dl{
      text-align:right !important;
      margin:0 1em 0 0 !important;
    }

    
    .live-block{ direction:rtl; text-align:right; }
    .live-label{ flex-direction:row-reverse; }
    .lk-quiz-opt{ text-align:right; }
  `;
}

export function deckDocument(
  markdownContent,
  themeCss,
  dir = "ltr",
  lang = "en",
) {
  const { transformed, liveSources } = extractLiveBlocks(markdownContent);
  const esc = transformed.replace(/<\/textarea>/g, "&lt;/textarea&gt;");
  const sourcesJson = JSON.stringify(liveSources).replace(/</g, "\\u003c");
  return `<!doctype html>
  <html dir="${dir}" lang="${lang}">
  <head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@6.0.1/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@6.0.1/plugin/highlight/monokai.css">
  <style id="reveal-theme">${themeCss.replace(/<\/style/gi, "<\\/style")}</style>
  <style>
    /* ---- live code blocks ---- */
.live-block{ margin:20px 0; border:1px solid #2a3145; border-radius:10px; background:#040810 ; overflow:hidden; text-align:left; }
.live-label{ display:flex; align-items:center; justify-content:space-between; padding:6px 12px; font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#ff8a45; background:#0b1120; border-bottom:1px solid #2a3145; }
.live-rerun{ background:none; border:none; color:#b9b8ce; cursor:pointer; font-size:15px; line-height:1; padding:2px 7px; border-radius:4px; font-family:inherit; }
.live-rerun:hover{ color:#ff8a45; background:#131a2c; }
.live-stage{ padding:22px; min-height:50px; }
.live-error{ color:#ff6e76; font-family:'JetBrains Mono', monospace; font-size:13px; white-space:pre-wrap; }

.lk-quiz-q{ font-size:20px; margin-bottom:14px; color:#eef1fa; font-family:'Inter',sans-serif; line-height:1.4; }
.lk-quiz-options{ display:flex; flex-direction:column; gap:8px; }
.lk-quiz-opt{ text-align:left; padding:10px 14px; border-radius:6px; border:1px solid #2a3145; background:#0b1120; color:#b9b8ce; cursor:pointer; font-family:'Inter',sans-serif; font-size:16px; transition:border-color .15s, background .15s; }
.lk-quiz-opt:hover:not(:disabled){ border-color:#ff8a45; }
.lk-quiz-opt:disabled{ cursor:default; opacity:.9; }
.lk-quiz-opt.lk-correct{ border-color:#7cffb2; background:#0f2419; color:#a9f5cb; }
.lk-quiz-opt.lk-incorrect{ border-color:#ff6e76; background:#2a1416; color:#ffb3b8; }
.lk-quiz-explain{ margin-top:12px; font-size:14px; color:#b9b8ce; font-style:italic; }
  </style>
  <style id="reveal-direction-overrides">${directionOverrides(dir)}</style>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=Inter:wght@400;600&family=JetBrains+Mono&family=Noto+Sans+Arabic:wght@400;600&display=swap" rel="stylesheet">
  </head>
  <body>
  <div class="reveal">
    <div class="slides">
      <section data-markdown data-separator="^\\n---\\n$" data-separator-vertical="^\\n--\\n$" data-separator-notes="^Note:">
        <textarea data-template>${esc}</textarea>
      </section>
    </div>
  </div>
  <script id="live-sources" type="application/json">${sourcesJson}<\/script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@6.0.1/dist/reveal.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@6.0.1/dist/plugin/markdown.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@6.0.1/dist/plugin/highlight.js"><\/script>

  <script>
    // Small helper library available inside every live code block as LiveKit.
    window.LiveKit = {
      quiz(container, opts){
        const { question, options, correct, explain } = opts;
        const root = document.createElement('div');
        const q = document.createElement('div'); q.className = 'lk-quiz-q'; q.textContent = question;
        root.appendChild(q);
        const list = document.createElement('div'); list.className = 'lk-quiz-options';
        let answered = false;
        options.forEach((opt, i)=>{
  const btn = document.createElement('button');
  btn.className = 'lk-quiz-opt';
  btn.textContent = opt;
  btn.addEventListener('click', ()=>{
    if(answered) return;
    answered = true;
    [...list.children].forEach((b, j)=>{
      b.disabled = true;
      if(j === correct) b.classList.add('lk-correct');
      else if(j === i) b.classList.add('lk-incorrect');
    });
    if(explain){
      const ex = document.createElement('div');
      ex.className = 'lk-quiz-explain';
      ex.textContent = explain;
      root.appendChild(ex);
    }
  });
  list.appendChild(btn);
        });
        root.appendChild(list);
        container.appendChild(root);
        return root;
      },
      el(tag, attrs, children){
        attrs = attrs || {}; children = children || [];
        const isSvg = ['svg','g','circle','line','rect','text','path','polyline','polygon'].includes(tag);
        const e = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
        Object.entries(attrs).forEach(([k,v])=>{
  if(k === 'style' && typeof v === 'object') Object.assign(e.style, v);
  else if(k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
  else e.setAttribute(k, v);
        });
        (Array.isArray(children) ? children : [children]).forEach(c=>{
  if(c == null) return;
  e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        });
        return e;
      }
    };

    // Re-run Reveal layout so center:true vertical centering (top = (h - scrollHeight)/2)
    // is recomputed after live content expands. Without this, the slide keeps the top
    // computed for the tiny placeholder and live blocks appear to start from the centre then down.
    let _layoutPending = false;
    function _doLayout(){
      try{
        if(window.deck && typeof deck.layout === 'function') deck.layout();
        else if(window.Reveal && typeof Reveal.layout === 'function') Reveal.layout();
      }catch(e){}
    }
    function scheduleLayout(){
      if(_layoutPending) return;
      _layoutPending = true;
      // Run once immediately for instant correction, then again next frame to catch
      // late DOM paints (images, fonts). The flag prevents observer loops.
      try{ _doLayout(); }catch(e){}
      requestAnimationFrame(()=>{
        _layoutPending = false;
        try{ _doLayout(); }catch(e){}
      });
    }
    function scheduleLayoutDeferred(delay){
      setTimeout(scheduleLayout, delay);
    }

    function activateLiveBlocks(){
      let sources = [];
      try{
        const el = document.getElementById('live-sources');
        sources = el ? JSON.parse(el.textContent || '[]') : [];
      }catch(err){ sources = []; }

      document.querySelectorAll('.live-block-slot').forEach(slot=>{
        const idx = parseInt(slot.getAttribute('data-live-index'), 10);
        const source = sources[idx];
        if(source == null) return;

        const wrap = document.createElement('div');
        wrap.className = 'live-block';
        const label = document.createElement('div');
        label.className = 'live-label';
        const tag = document.createElement('span'); tag.textContent = '● Live';
        const rerun = document.createElement('button');
        rerun.className = 'live-rerun'; rerun.title = 'Re-run'; rerun.textContent = '↻';
        label.appendChild(tag); label.appendChild(rerun);
        const stage = document.createElement('div');
        stage.className = 'live-stage';
        wrap.appendChild(label); wrap.appendChild(stage);
        slot.replaceWith(wrap);

        function run(){
  stage.innerHTML = '';

  // Live blocks run as real ES modules (via a blob URL + dynamic import)
  // rather than new Function(...), so top-level import statements
  // inside 'source' are legal. Module top-level code can't receive
  // function arguments, so container/LiveKit/d3 are handed in
  // by stashing them on window under a per-run key and re-declaring
  // them as top-level consts inside the generated module source.
  window.__lkCtx = window.__lkCtx || {};
  const ctxKey = 'b' + idx + '_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  window.__lkCtx[ctxKey] = {
    container: stage,
    LiveKit: window.LiveKit,
    d3: window.d3
  };

  const moduleSrc = [
    'const __ctx = window.__lkCtx["' + ctxKey + '"];',
    'const container = __ctx.container;',
    'const LiveKit = __ctx.LiveKit;',
    'const d3 = __ctx.d3;',
    source
  ].join(String.fromCharCode(10));

  const blob = new Blob([moduleSrc], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);

  import(/* webpackIgnore: true */ url)
    .then(()=>{
      delete window.__lkCtx[ctxKey];
      URL.revokeObjectURL(url);
      // Live content rendered – slide height changed, re-center.
      scheduleLayout();
      requestAnimationFrame(scheduleLayout);
      setTimeout(scheduleLayout, 60);
      setTimeout(scheduleLayout, 250);
    })
    .catch((err)=>{
      stage.innerHTML = '';
      const e = document.createElement('div');
      e.className = 'live-error';
      e.textContent = (err && err.message) ? err.message : String(err);
      stage.appendChild(e);
      delete window.__lkCtx[ctxKey];
      URL.revokeObjectURL(url);
      scheduleLayout();
      requestAnimationFrame(scheduleLayout);
      setTimeout(scheduleLayout, 60);
    });
        }
        rerun.addEventListener('click', run);
        run();
      });
      // Synchronous insertion already grew the slide – layout now.
      scheduleLayout();
      requestAnimationFrame(scheduleLayout);
      setTimeout(scheduleLayout, 60);
    }


    const deck = new Reveal({
      hash: false, controls:true, progress:true, center:true,
      rtl: ${lang === "ar" || dir === "rtl"},
      plugins:[ RevealMarkdown, RevealHighlight ]
    });
    window.deck = deck;
    deck.initialize().then(()=>{
      activateLiveBlocks();
      // Multiple passes catch async ESM imports that expand later.
      scheduleLayout();
      requestAnimationFrame(scheduleLayout);
      setTimeout(scheduleLayout, 80);
      setTimeout(scheduleLayout, 350);
      setTimeout(scheduleLayout, 800);
      // Watch for any future size mutations inside live blocks / slides.
      try{
        const ro = new ResizeObserver(()=>scheduleLayout());
        document.querySelectorAll('.live-stage').forEach(el=>ro.observe(el));
        document.querySelectorAll('.reveal .slides section').forEach(el=>ro.observe(el));
        const mo = new MutationObserver(()=>scheduleLayout());
        document.querySelectorAll('.live-stage').forEach(el=>mo.observe(el,{childList:true,subtree:true,attributes:true,characterData:true}));
        // Also observe the whole slides container for new live blocks
        mo.observe(document.querySelector('.reveal .slides'),{childList:true,subtree:true});
      }catch(e){}
      const send = ()=>{
        const idx = deck.getIndices();
        parent.postMessage({ type:'state', total: deck.getTotalSlides(), h: idx.h, v: idx.v || 0 }, '*');
      };
      deck.on('slidechanged', ()=>{
        send();
        scheduleLayout();
        setTimeout(scheduleLayout, 50);
        setTimeout(scheduleLayout, 200);
      });
      deck.on('fragmentshown', scheduleLayout);
      deck.on('fragmenthidden', scheduleLayout);
      deck.on('ready', scheduleLayout);
      send();
      parent.postMessage({ type:'ready' }, '*');
    });
    window.addEventListener('resize', ()=>{ try{ scheduleLayout(); }catch(e){} });
    window.addEventListener('message', (e)=>{
      if(!e.data) return;
      if(e.data.type === 'goto'){
        try{ deck.slide(e.data.h, e.data.v || 0); }catch(err){}
      }
    });
  <\/script>
  </body>
  </html>`;
}
