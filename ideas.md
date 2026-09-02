 1. ◆ Flashcards – Flip 3D — state:{cards:[{front,back}], prompt, shuffle}
 2. ◆ Branching – Decision Tree — state:{startId, nodes:{id:{text,choices:[{label,to}]}}}
 3. ◆ Ranking – Sheet → Form — state:{prompt, sheetCsvUrl, items[], correctOrder[], formActionUrl, formFieldMap}
 4. ◆ 3D Model Viewer — state:{src, poster, alt, height, background, autoRotate, cameraControls, ar} (https://esm.sh/@google/model-viewer@3.4.0)
 5. ◆ QR Code — state:{url, size, ecc, caption, fg, bg} + LiveKit.qr() js/deck-builder.js:192
 6. ◆ Excalidraw – Draw — state:{exportFormat:"svg"|"png", height, background, dataUrl, checked, showToggle, strokeColor, strokeWidth} — draw canvas → SVG <path> / PNG dataUrl, deck Checked toggle
 7. ◆ Math – Numerals — state:{code, layout:"two-pane"|"answer-right"|"answer-below", renderStyle:"plain"|"tex", format, decimalPlaces} — full #: #=: #$: #$=: => $var/@prev/@total via mathjs@12.4.2 + katex@0.16.9
 9. ◆ Feedback – Thank-You Survey — state:{questions:[{q,type:"scale|text|choice",options}], thankYou, formActionUrl, formFieldMap} (generic Ranking pattern)
10. ◆ Website – Iframe — state:{url, height, allow, sandbox, showLink}
11. ◆ LaTeX – Solver — state:{latex, expr, vars, displayMode:"block|inline", autoSolve} (katex + mathjs solve)