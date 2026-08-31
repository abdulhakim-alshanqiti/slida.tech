import { Node, mergeAttributes } from 'https://esm.sh/@tiptap/core@2.4.0'
import { basicSetup } from 'https://esm.sh/codemirror@6.0.1?deps=@codemirror/state@6.4.1,@codemirror/view@6.26.3,@codemirror/commands@6.7.1,@codemirror/language@6.10.1,@codemirror/autocomplete@6.8.0,@codemirror/lint@6.4.2,@codemirror/search@6.5.2'
import { EditorView, keymap } from 'https://esm.sh/@codemirror/view@6.26.3?deps=@codemirror/state@6.4.1'
import { EditorState } from 'https://esm.sh/@codemirror/state@6.4.1'
import { javascript } from 'https://esm.sh/@codemirror/lang-javascript@6.2.2?deps=@codemirror/state@6.4.1,@codemirror/view@6.26.3,@codemirror/language@6.10.1'
import { indentWithTab } from 'https://esm.sh/@codemirror/commands@6.7.1?deps=@codemirror/state@6.4.1,@codemirror/view@6.26.3'
import { renderRenderView } from "./render-template.js";

export const HTMLRendererNode = Node.create({
  name: 'htmlRenderer',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      // 1. Config Generator (Generates HTML for the Preview Config tab)
      configGenerator: {
        default: `// Use container, state, and updateState
// You can dynamically add ANY keys to state using updateState()

const qLabel = document.createElement('label');
qLabel.textContent = 'Question Text:';
qLabel.style.display = 'block';
qLabel.style.marginBottom = '5px';
qLabel.style.fontWeight = 'bold';
qLabel.style.color = '#bd93f9';

const qInput = document.createElement('input');
qInput.type = 'text';
qInput.value = state.question || '';
qInput.style.width = '100%';
qInput.style.padding = '8px';
qInput.style.marginBottom = '15px';
qInput.style.boxSizing = 'border-box';
qInput.style.background = '#2b2b2b';
qInput.style.color = '#f8f8f2';
qInput.style.border = '1px solid #44475a';
qInput.style.borderRadius = '4px';
qInput.addEventListener('input', () => updateState({ question: qInput.value }));

const optLabel = document.createElement('label');
optLabel.textContent = 'Options (comma separated):';
optLabel.style.display = 'block';
optLabel.style.marginBottom = '5px';
optLabel.style.fontWeight = 'bold';
optLabel.style.color = '#bd93f9';

const optInput = document.createElement('textarea');
optInput.value = (state.options || []).join(', ');
optInput.style.width = '100%';
optInput.style.padding = '8px';
optInput.style.marginBottom = '15px';
optInput.style.boxSizing = 'border-box';
optInput.style.background = '#2b2b2b';
optInput.style.color = '#f8f8f2';
optInput.style.border = '1px solid #44475a';
optInput.style.borderRadius = '4px';
optInput.addEventListener('input', () => {
  const opts = optInput.value.split(',').map(s => s.trim());
  updateState({ options: opts });
});

// Example of a dynamic key input
const dynamicLabel = document.createElement('label');
dynamicLabel.textContent = 'Dynamic Custom Key:';
dynamicLabel.style.display = 'block';
dynamicLabel.style.marginBottom = '5px';
dynamicLabel.style.fontWeight = 'bold';
dynamicLabel.style.color = '#bd93f9';

const dynamicInput = document.createElement('input');
dynamicInput.type = 'text';
dynamicInput.value = state.myCustomKey || '';
dynamicInput.style.width = '100%';
dynamicInput.style.padding = '8px';
dynamicInput.style.marginBottom = '15px';
dynamicInput.style.boxSizing = 'border-box';
dynamicInput.style.background = '#2b2b2b';
dynamicInput.style.color = '#f8f8f2';
dynamicInput.style.border = '1px solid #44475a';
dynamicInput.style.borderRadius = '4px';
dynamicInput.addEventListener('input', () => updateState({ myCustomKey: dynamicInput.value }));

container.appendChild(qLabel);
container.appendChild(qInput);
container.appendChild(optLabel);
container.appendChild(optInput);
container.appendChild(dynamicLabel);
container.appendChild(dynamicInput);`
      },
      
      // 2. Render View (Automatically treated as a raw Mustache template)
      renderView: {
        default: `// 1. Inject a small stylesheet for hover/focus states (makes it feel much more premium)
const style = document.createElement('style');
style.textContent = \`
  .quiz-wrapper button:hover:not(:disabled) {
    border-color: #bd93f9 !important;
    background: #2b2b2b !important;
  }
  .quiz-wrapper button:focus-visible {
    outline: 2px solid #50fa7b;
    outline-offset: 2px;
  }
\`;
document.head.appendChild(style);

// 2. Create a wrapper for encapsulation and max-width
const wrapper = document.createElement('div');
wrapper.className = 'quiz-wrapper';
wrapper.style.fontFamily = 'system-ui, -apple-system, sans-serif';
wrapper.style.maxWidth = '600px';
wrapper.style.margin = '0 auto';
wrapper.style.color = '#f8f8f2';

// 3. Question Element (Using semantic <h2> instead of <div>)
const question = document.createElement('h2');
question.textContent = '{{question}}';
question.style.fontSize = '24px';
question.style.fontWeight = '700';
question.style.marginBottom = '24px';
question.style.color = '#bd93f9';
question.style.lineHeight = '1.3';

// 4. Explanation Element (Hidden by default)
const explanation = document.createElement('div');
explanation.style.display = 'none';
explanation.style.marginTop = '24px';
explanation.style.padding = '16px';
explanation.style.borderRadius = '8px';
explanation.style.fontSize = '15px';
explanation.style.lineHeight = '1.5';
explanation.style.borderLeft = '4px solid #50fa7b';
explanation.style.background = '#2b2b2b';
explanation.style.color = '#f1fa8c';

// 5. Choices Container
const choices = document.createElement('div');
choices.style.display = 'flex';
choices.style.flexDirection = 'column';
choices.style.gap = '12px';
choices.setAttribute('role', 'radiogroup'); // Accessibility

// Note: Ensure your template engine passes 'correct_index' (number) and 'explanation' (string)
const options = [{{#options}}'{{.}}', {{/options}}];
const correctIndex = {{correct_index}}; 


// 6. Generate Option Buttons
options.forEach((option, index) => {
  const button = document.createElement('button');
  button.textContent = option;
  button.setAttribute('role', 'radio');
  button.setAttribute('aria-checked', 'false');

  // Apply base styles cleanly using Object.assign
  Object.assign(button.style, {
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: '500',
    textAlign: 'left',
    borderRadius: '8px',
    border: '2px solid #44475a',
    cursor: 'pointer',
    background: '#2b2b2b',
    color: '#f8f8f2',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    outline: 'none'
  });

  button.addEventListener('click', () => {
    // Disable all buttons after a choice is made
    choices.querySelectorAll('button').forEach(btn => {
      btn.style.cursor = 'default';
      btn.disabled = true;
    });

    if (index === correctIndex) {
      // Correct Answer Styling
      button.style.background = '#50fa7b22';
      button.style.borderColor = '#50fa7b';
      button.style.color = '#50fa7b';

    } else {
      // Incorrect Answer Styling
      button.style.background = '#ff555522';
      button.style.borderColor = '#ff5555';
      button.style.color = '#ff5555';

      // Highlight the actual correct answer for the user
      const correctBtn = choices.children[correctIndex];
      correctBtn.style.background = '#50fa7b22';
      correctBtn.style.borderColor = '#50fa7b';
      correctBtn.style.color = '#50fa7b';

    }

    explanation.style.display = 'block';
  });

  choices.appendChild(button);
});

// 7. Append everything to the DOM
wrapper.appendChild(question);
wrapper.appendChild(choices);
wrapper.appendChild(explanation);

// Assuming 'container' is defined in your outer scope
container.appendChild(wrapper); `
      },
      
      // 3. Internal State Object (Free-form JSON object to support dynamic keys at runtime)
      state: {
        default: {
          question: 'Which language runs natively in the browser?',
          options: ['Python', 'JavaScript', 'Rust', 'Go'],
          myCustomKey: 'Hello World'
        },
        parseHTML: element => {
          try {
            return JSON.parse(element.getAttribute('data-state') || '{}')
          } catch (e) {
            return {}
          }
        },
        renderHTML: attributes => {
          return {
            'data-state': JSON.stringify(attributes.state || {}),
          }
        },
      },
    }
  },

  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          const payload = JSON.stringify({
            configGenerator: node.attrs.configGenerator || '',
            renderView: node.attrs.renderView || '',
            state: node.attrs.state || {},
          })
          state.write('```htmlrenderer\n')
          state.text(payload, false)
          state.ensureNewLine()
          state.write('```')
          state.closeBlock(node)
        },
        parse: {
          updateDOM(element) {
            element.querySelectorAll('code.language-htmlrenderer').forEach((code) => {
              const pre = code.parentElement
              if (!pre) return
              let data = {}
              try {
                data = JSON.parse(code.textContent || '{}')
              } catch (e) {
                data = {}
              }
              const div = document.createElement('div')
              div.setAttribute('data-type', 'html-renderer')
              div.setAttribute('data-config-generator', data.configGenerator || '')
              div.setAttribute('data-render-view', data.renderView || '')
              div.setAttribute('data-state', JSON.stringify(data.state || {}))
              pre.replaceWith(div)
            })
          },
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="html-renderer"]',
        getAttrs: element => {
          let configGenerator = element.getAttribute('data-config-generator') || ''
          let renderView = element.getAttribute('data-render-view') || ''
          let state = {}
          try {
            state = JSON.parse(element.getAttribute('data-state') || '{}')
          } catch (e) {}
          return { configGenerator, renderView, state }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      mergeAttributes(HTMLAttributes, { 
        'data-type': 'html-renderer',
        'data-config-generator': HTMLAttributes.configGenerator,
        'data-render-view': HTMLAttributes.renderView,
      })
    ]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node
      let isDestroyed = false
      const container = document.createElement('div')
      container.className = 'tiptap-html-renderer-container'
      container.contentEditable = 'false'
      container.style.color = '#f8f8f2'

      // --- EVENT BLOCKER ---
      const isInteractive = (target) => {
        if (!target || !target.tagName) return false
        if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName) || target.isContentEditable) {
          return true
        }
        if (target.closest && target.closest('.cm-editor')) return true
        return false
      }

      const stopPropagationIfInteractive = (e) => {
        if (isInteractive(e.target)) {
          e.stopPropagation()
        }
      }

      const eventsToBlock = [
        'mousedown', 'mouseup', 'click',
        'keydown', 'keyup', 'keypress',
        'focusin', 'focusout',
        'beforeinput', 'input',
        'compositionstart', 'compositionend'
      ]

      eventsToBlock.forEach(eventType => {
        container.addEventListener(eventType, stopPropagationIfInteractive)
      })

      // --- ROBUST ATTRIBUTE UPDATER ---
      const updateNodeAttributes = (newAttributes) => {
        const pos = typeof getPos === 'function' ? getPos() : getPos
        const latestNode = editor.state.doc.nodeAt(pos)
        
        if (latestNode && pos !== false && pos !== -1) {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              ...latestNode.attrs,
              ...newAttributes
            })
          )
        }
      }

      // --- Helper: Extract keys managed by the Config Generator ---
      const extractManagedKeys = (script) => {
        const keys = new Set();
        if (!script) return keys;
        
        const stateMatches = script.matchAll(/state\s*(?:\??\.)\s*([a-zA-Z0-9_]+)/g);
        for (const match of stateMatches) {
          keys.add(match[1]);
        }
        
        const stateBracketMatches = script.matchAll(/state\[['"]([a-zA-Z0-9_]+)['"]\]/g);
        for (const match of stateBracketMatches) {
          keys.add(match[1]);
        }
        
        const updateMatches = script.matchAll(/updateState\s*\(\s*\{([^}]*)\}/g);
        for (const match of updateMatches) {
          const props = match[1].split(',');
          for (const prop of props) {
            const keyMatch = prop.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
            if (keyMatch) {
              keys.add(keyMatch[1]);
            }
          }
        }
        
        return keys;
      }

      // --- Helper: Prune state based on Config Generator ---
      const pruneState = (currentState, script) => {
        const managedKeys = extractManagedKeys(script);
        const pruned = {};
        for (const key in currentState) {
          if (managedKeys.has(key)) {
            pruned[key] = currentState[key];
          }
        }
        return pruned;
      }

      // --- Helper: Debounce ---
      const debounce = (func, wait) => {
        let timeout
        return (...args) => {
          clearTimeout(timeout)
          timeout = setTimeout(() => {
            if (!isDestroyed) func(...args)
          }, wait)
        }
      }

      // --- Tab Navigation ---
      const tabNav = document.createElement('div')
      tabNav.className = 'html-renderer-tabs'
      tabNav.style.display = 'flex'
      tabNav.style.gap = '8px'
      tabNav.style.marginBottom = '16px'
      tabNav.style.borderBottom = '1px solid #44475a'
      tabNav.style.paddingBottom = '8px'

      const tabPreview = document.createElement('button')
      tabPreview.textContent = 'Preview (Config)'
      tabPreview.className = 'tab-button active'
      
      const tabCode = document.createElement('button')
      tabCode.textContent = 'Code'
      tabCode.className = 'tab-button'

      const baseTabStyle = {
        padding: '8px 16px',
        background: 'transparent',
        color: '#f8f8f2',
        border: '1px solid transparent',
        borderBottom: 'none',
        borderRadius: '4px 4px 0 0',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      }

      Object.assign(tabPreview.style, baseTabStyle)
      Object.assign(tabCode.style, baseTabStyle)

      const updateTabStyles = () => {
        if (tabPreview.classList.contains('active')) {
          Object.assign(tabPreview.style, { background: '#2b2b2b', borderColor: '#44475a', color: '#bd93f9' })
          Object.assign(tabCode.style, { background: 'transparent', borderColor: 'transparent', color: '#f8f8f2' })
        } else {
          Object.assign(tabCode.style, { background: '#2b2b2b', borderColor: '#44475a', color: '#bd93f9' })
          Object.assign(tabPreview.style, { background: 'transparent', borderColor: 'transparent', color: '#f8f8f2' })
        }
      }

      updateTabStyles()

      const setActiveTab = (tab) => {
        if (tab === 'preview') {
          const currentState = currentNode.attrs.state || {};
          const prunedState = pruneState(currentState, currentNode.attrs.configGenerator);
          if (JSON.stringify(prunedState) !== JSON.stringify(currentState)) {
              updateNodeAttributes({ state: prunedState });
          }

          tabPreview.classList.add('active')
          tabCode.classList.remove('active')
          updateTabStyles()
          leftPane.style.display = 'block'
          codeContainer.style.display = 'none'
          renderViewPane.style.display = 'none'   // iframe is fullscreen-only (by default)
          renderPreviewConfig(currentNode)
        } else {
          tabCode.classList.add('active')
          tabPreview.classList.remove('active')
          updateTabStyles()
          leftPane.style.display = 'none'
          codeContainer.style.display = 'block'
          
          configGenEditor.setValue(currentNode.attrs.configGenerator)
          renderViewEditor.setValue(currentNode.attrs.renderView)
        }
      }

      tabPreview.addEventListener('click', () => setActiveTab('preview'))
      tabCode.addEventListener('click', () => setActiveTab('code'))

      tabNav.append(tabPreview, tabCode)
      container.append(tabNav)

      // ==========================================
      // PREVIEW TAB: GENERATED BY CONFIG GENERATOR + RENDER VIEW IFRAME
      // ==========================================
      const previewContainer = document.createElement('div')
      previewContainer.className = 'html-renderer-preview'

      const leftPane = document.createElement('div')
      leftPane.className = 'html-renderer-left-pane'

      const renderViewPane = document.createElement('div')
      renderViewPane.className = 'html-renderer-renderview-pane'
      renderViewPane.style.display = 'none'

      const renderViewPaneLabel = document.createElement('label')
      renderViewPaneLabel.textContent = 'Render View Output (isolated iframe, rendered against state):'
      renderViewPaneLabel.className = 'editor-label'
      renderViewPaneLabel.style.color = '#bd93f9'
      renderViewPaneLabel.style.display = 'block'
      renderViewPaneLabel.style.marginBottom = '8px'
      renderViewPaneLabel.style.fontWeight = '600'

      const renderViewIframe = document.createElement('iframe')
      renderViewIframe.className = 'html-renderer-renderview-iframe'
      renderViewIframe.title = 'Render View Output'

      renderViewPane.append(renderViewPaneLabel, renderViewIframe)
      leftPane.append(previewContainer, renderViewPane)

      // ==========================================
      // CODE TAB: CODEMIRROR 6 JS EDITORS
      // ==========================================
      const codeContainer = document.createElement('div')
      codeContainer.className = 'html-renderer-code'
      codeContainer.style.display = 'none'

      // --- Helper: build a CodeMirror 6 JS editor ---
      const createCodeMirrorEditor = ({ doc, minHeight, onChange, onBlur }) => {
        const dom = document.createElement('div')
        dom.className = 'code-editor'

        const updateListener = EditorView.updateListener.of((update) => {
          if (update.docChanged && typeof onChange === 'function') {
            onChange(update.state.doc.toString())
          }
        })

        const blurHandler = EditorView.domEventHandlers({
          blur: () => {
            if (typeof onBlur === 'function') onBlur()
          },
        })

        const theme = EditorView.theme({
          '&': {
            fontSize: '13px',
            minHeight: minHeight || 'auto',
            border: '1px solid #44475a',
            borderRadius: '4px',
            backgroundColor: '#191919',
            color: '#f8f8f2'
          },
          '.cm-scroller': {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            overflow: 'auto',
          },
          '.cm-content': {
            padding: '8px',
            color: '#f8f8f2'
          },
          '.cm-activeLine': {
            backgroundColor: '#2b2b2b'
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#2b2b2b'
          },
          '.cm-gutters': {
            backgroundColor: '#191919',
            color: '#6272a4',
            borderRight: '1px solid #44475a'
          }
        })

        const view = new EditorView({
          state: EditorState.create({
            doc: doc || '',
            extensions: [
              basicSetup,
              javascript(),
              keymap.of([indentWithTab]),
              EditorView.lineWrapping,
              theme,
              updateListener,
              blurHandler,
            ],
          }),
          parent: dom,
        })

        return {
          dom,
          view,
          getValue: () => view.state.doc.toString(),
          setValue: (value) => {
            const nextValue = value || ''
            const current = view.state.doc.toString()
            if (current === nextValue) return
            view.dispatch({
              changes: { from: 0, to: current.length, insert: nextValue },
            })
          },
        }
      }

      // 1. Config Generator
      const configGenLabel = document.createElement('label')
      configGenLabel.textContent = 'Config Generator (JS) - Use `container`, `state`, and `updateState()`:'
      configGenLabel.className = 'editor-label'
      configGenLabel.style.color = '#bd93f9'
      configGenLabel.style.display = 'block'
      configGenLabel.style.marginBottom = '8px'
      configGenLabel.style.fontWeight = '600'

      const configGenEditor = createCodeMirrorEditor({
        doc: currentNode.attrs.configGenerator,
        minHeight: '250px',
        onChange: (value) => {
          updateNodeAttributes({ configGenerator: value })
        },
        onBlur: () => {
          const currentState = currentNode.attrs.state || {};
          const prunedState = pruneState(currentState, configGenEditor.getValue());
          if (JSON.stringify(prunedState) !== JSON.stringify(currentState)) {
              updateNodeAttributes({ state: prunedState });
          }
        },
      })

      // 2. Render View
      const renderViewLabel = document.createElement('label')
      renderViewLabel.textContent = 'Render View (Mustache Template) - Automatically rendered against state:'
      renderViewLabel.className = 'editor-label'
      renderViewLabel.style.color = '#bd93f9'
      renderViewLabel.style.display = 'block'
      renderViewLabel.style.marginBottom = '8px'
      renderViewLabel.style.fontWeight = '600'

      const renderViewEditor = createCodeMirrorEditor({
        doc: currentNode.attrs.renderView,
        minHeight: '150px',
        onChange: (value) => {
          updateNodeAttributes({ renderView: value })
        },
      })

      const configGenGroup = document.createElement('div')
      configGenGroup.className = 'code-editor-group'
      configGenGroup.append(configGenLabel, configGenEditor.dom)

      const renderViewGroup = document.createElement('div')
      renderViewGroup.className = 'code-editor-group'
      renderViewGroup.append(renderViewLabel, renderViewEditor.dom)

      // --- Fullscreen toggle ---
      let isFullscreen = false

      const fullscreenBtn = document.createElement('button')
      fullscreenBtn.textContent = 'Fullscreen'
      fullscreenBtn.style.marginBottom = '10px'
      fullscreenBtn.style.padding = '8px 12px'
      fullscreenBtn.style.cursor = 'pointer'
      fullscreenBtn.style.background = '#2b2b2b'
      fullscreenBtn.style.color = '#f8f8f2'
      fullscreenBtn.style.border = '1px solid #44475a'
      fullscreenBtn.style.borderRadius = '4px'
      fullscreenBtn.style.fontWeight = '500'

      const handleFullscreenKeydown = (e) => {
        if (e.key === 'Escape' && isFullscreen) {
          e.stopPropagation()
          exitFullscreen()
        }
      }

      const enterFullscreen = () => {
        isFullscreen = true
        fullscreenBtn.textContent = 'Exit Fullscreen (Esc)'
        container.classList.add('html-renderer-fullscreen')
        tabNav.style.display = 'none'

        // Ensure both panes are visible side-by-side
        leftPane.style.display = 'flex'
        codeContainer.style.display = 'flex'

        Object.assign(container.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100vw',
          height: '100vh',
          zIndex: '9999',
          background: '#191919',
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row', // Side-by-side layout
          gap: '16px',
          overflow: 'hidden',
          color: '#f8f8f2'
        })

        Object.assign(leftPane.style, {
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '0',
          overflow: 'hidden',
          border: '1px solid #44475a',
          borderRadius: '4px',
          padding: '16px',
          background: '#2b2b2b',
          boxSizing: 'border-box',
        })

        // Config preview stays on top, capped so the iframe gets the rest
        Object.assign(previewContainer.style, {
          flex: '0 0 auto',
          maxHeight: '45%',
          overflow: 'auto',
        })

        // Render View iframe fills the remaining space (your circled area)
        Object.assign(renderViewPane.style, {
          display: 'flex',
          flexDirection: 'column',
          flex: '1',
          minHeight: '0',
          marginTop: '12px',
        })

        Object.assign(renderViewIframe.style, {
          flex: '1',
          minHeight: '0',
          width: '100%',
          border: '1px solid #44475a',
          borderRadius: '4px',
          background: '#191919',
        })

        Object.assign(codeContainer.style, {
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '0',
          overflow: 'hidden',
        })

        ;[configGenGroup, renderViewGroup].forEach((group) => {
          Object.assign(group.style, {
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '0',
            marginBottom: '10px',
          })
        })

        ;[configGenEditor, renderViewEditor].forEach((ed) => {
          Object.assign(ed.dom.style, {
            flex: '1',
            minHeight: '0',
            overflow: 'hidden',
          })
          ed.view.dom.style.height = '100%'
        })

        renderRenderViewPreview(currentNode)

        document.addEventListener('keydown', handleFullscreenKeydown, true)
      }

      const exitFullscreen = () => {
        isFullscreen = false
        fullscreenBtn.textContent = 'Fullscreen'
        container.classList.remove('html-renderer-fullscreen')
        tabNav.style.display = ''

        // Reset container styles
        ;['position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'zIndex',
          'background', 'padding', 'boxSizing', 'display', 'flexDirection', 'overflow', 'gap', 'color'
        ].forEach((prop) => { container.style[prop] = '' })

        // Reset leftPane styles
        ;['flex','display','flexDirection','minHeight','overflow','border','borderRadius','padding','background','boxSizing'].forEach((prop) => { leftPane.style[prop] = '' })

        // Reset previewContainer styles
        ;['flex','maxHeight','overflow'].forEach((prop) => { previewContainer.style[prop] = '' })

        // Hide + reset the render view iframe outside fullscreen
        renderViewPane.style.display = 'none'
        ;['display','flexDirection','flex','minHeight','marginTop'].forEach((prop) => { renderViewPane.style[prop] = '' })
        ;['flex','minHeight','width','border','borderRadius','background'].forEach((prop) => { renderViewIframe.style[prop] = '' })

        // Reset codeContainer styles
        ;['flex', 'display', 'flexDirection', 'minHeight', 'overflow'].forEach((prop) => {
          codeContainer.style[prop] = ''
        })

        ;[configGenGroup, renderViewGroup].forEach((group) => {
          ;['flex', 'display', 'flexDirection', 'minHeight', 'marginBottom'].forEach((prop) => {
            group.style[prop] = ''
          })
        })

        ;[configGenEditor, renderViewEditor].forEach((ed) => {
          ;['flex', 'minHeight', 'overflow'].forEach((prop) => {
            ed.dom.style[prop] = ''
          })
          ed.view.dom.style.height = ''
        })

        // Restore tab-based visibility (on the wrapper now)
        if (tabPreview.classList.contains('active')) {
          leftPane.style.display = 'block'
          codeContainer.style.display = 'none'
        } else {
          leftPane.style.display = 'none'
          codeContainer.style.display = 'block'
        }

        document.removeEventListener('keydown', handleFullscreenKeydown, true)
      }

      fullscreenBtn.addEventListener('click', () => {
        if (isFullscreen) {
          exitFullscreen()
        } else {
          enterFullscreen()
        }
      })

      codeContainer.append(
        fullscreenBtn,
        configGenGroup,
        renderViewGroup
      )
      
      container.append(leftPane, codeContainer)

      // --- Helper: Render Preview Config ---
      const renderPreviewConfig = (n) => {
        previewContainer.innerHTML = ''
        const wrapper = document.createElement('div')
        previewContainer.appendChild(wrapper)
        wrapper.style.color = '#f8f8f2'

        const currentState = n.attrs.state || {}

        const immediateUpdateState = (updates) => {
          const pos = typeof getPos === 'function' ? getPos() : getPos
          const latestNode = editor.state.doc.nodeAt(pos)
          if (!latestNode) return
          
          const latestState = latestNode.attrs.state || {}
          const newState = { ...latestState, ...updates }
          
          updateNodeAttributes({ state: newState })
        }

        const debouncedUpdateState = debounce(immediateUpdateState, 300)

        const updateState = (updates) => {
          // Structural changes (e.g. adding a new plain-text token) must
          // re-render the config generator immediately — otherwise the UI
          // looks stale even though `state` already contains the new entry
          // (the previous `isPreviewFocused` guard also blocked the
          // re-render while the "+ Add plain text" button retained focus).
          let isStructural = false
          const baseState = n.attrs.state || {}
          for (const key in updates) {
            const nextVal = updates[key]
            const prevVal = baseState[key]
            if (Array.isArray(nextVal) && Array.isArray(prevVal) && nextVal.length !== prevVal.length) {
              isStructural = true
              break
            }
            if (Array.isArray(nextVal) && !Array.isArray(prevVal)) {
              isStructural = true
              break
            }
            if (!(key in baseState)) {
              isStructural = true
              break
            }
            // Any change to `tokens` reshapes the config UI (e.g. switching
            // a card between "plain" and "part" via the combobox must show
            // or hide the Name/Formula/Explanation fields immediately).
            if (key === 'tokens' && JSON.stringify(nextVal) !== JSON.stringify(prevVal)) {
              isStructural = true
              break
            }
          }
          if (isStructural) {
            // Correct stale closures for rapid array appends (e.g. double-
            // clicking "+ Add plain text" before the first debounce/re-render
            // completes). The handler's `tokens.slice()` is based on the
            // snapshot captured at render time, so a second click would
            // produce the same length array. Detect an "append to base"
            // pattern and apply the suffix onto the *latest* state instead.
            const pos = typeof getPos === 'function' ? getPos() : getPos
            const latestNode = editor.state.doc.nodeAt(pos)
            const latestState = latestNode ? (latestNode.attrs.state || {}) : baseState
            const corrected = {}
            for (const key in updates) {
              const nextVal = updates[key]
              const baseVal = baseState[key]
              const latestVal = latestState[key]
              if (Array.isArray(nextVal) && Array.isArray(baseVal) && Array.isArray(latestVal) && nextVal.length > baseVal.length) {
                let isExtension = true
                for (let i = 0; i < baseVal.length; i++) {
                  if (JSON.stringify(baseVal[i]) !== JSON.stringify(nextVal[i])) {
                    isExtension = false
                    break
                  }
                }
                if (isExtension) {
                  const appended = nextVal.slice(baseVal.length)
                  corrected[key] = [...latestVal, ...appended]
                  continue
                }
              }
              corrected[key] = nextVal
            }
            const newState = { ...latestState, ...corrected }
            updateNodeAttributes({ state: newState })
          } else {
            debouncedUpdateState(updates)
          }
        }

        try {
          const configFunc = new Function('container', 'state', 'updateState', n.attrs.configGenerator)
          configFunc(wrapper, currentState, updateState)
        } catch (e) {
          wrapper.innerHTML = `<pre style="color: #ff5555; background: #2b2b2b; padding: 10px; border-radius: 4px; white-space: pre-wrap; border: 1px solid #44475a;">Config Generator Error: ${e.message}</pre>`
        }
      }

      // --- Helper: Render Render View into the isolated iframe ---
   const renderRenderViewPreview = (n) => {
  const state = n.attrs.state || {}
  let code
  try {
    code = renderRenderView(n.attrs.renderView || '', state)
  } catch (e) {
    code = 'container.textContent = ' + JSON.stringify('Render View Error: ' + (e && e.message ? e.message : String(e))) + ';'
  }

  // Escape </script> so user code can't break out of the inline script tag
  const safeCode = code.replace(/<\/script/gi, '<\\/script')

  renderViewIframe.srcdoc =
    '<!doctype html><html><head><meta charset="utf-8"><style>' +
    'html,body{margin:0;padding:20px;background:#191919;font-family:system-ui,-apple-system,sans-serif;color:#f8f8f2;}' +
    '</style></head><body>' +
    '<div id="rv-root"></div>' +
    // ✅ KEY CHANGE: type="module" enables import/export syntax
    '<script type="module">' +
    // Global error handler catches runtime errors (since we can't wrap imports in try/catch)
    'window.onerror = function(msg, url, line, col, error) {' +
    '  var pre = document.createElement("pre");' +
    '  pre.style.cssText = "color:#ff5555;background:#2b2b2b;padding:10px;border-radius:4px;white-space:pre-wrap;border:1px solid #44475a;";' +
    '  pre.textContent = "Render View Error: " + msg;' +
    '  document.body.appendChild(pre);' +
    '  return false;' +
    '};' +
    'window.addEventListener("unhandledrejection", function(event) {' +
    '  var pre = document.createElement("pre");' +
    '  pre.style.cssText = "color:#ff5555;background:#2b2b2b;padding:10px;border-radius:4px;white-space:pre-wrap;border:1px solid #44475a;";' +
    '  pre.textContent = "Render View Error (Promise): " + (event.reason && event.reason.message ? event.reason.message : String(event.reason));' +
    '  document.body.appendChild(pre);' +
    '});' +
    'var container = document.getElementById("rv-root");' +
    // ✅ Code injected directly at module top-level — imports work here
    safeCode +
    '<\/script></body></html>'
}

      // Initial render
      renderPreviewConfig(currentNode)

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) return false
          
          const configGenChanged = updatedNode.attrs.configGenerator !== currentNode.attrs.configGenerator
          const renderViewChanged = updatedNode.attrs.renderView !== currentNode.attrs.renderView
          
          let newState = updatedNode.attrs.state || {};
          let needsStateUpdate = false;

          if (configGenChanged) {
              const pruned = pruneState(newState, updatedNode.attrs.configGenerator);
              if (JSON.stringify(pruned) !== JSON.stringify(newState)) {
                  newState = pruned;
                  needsStateUpdate = true;
              }
          }

          const stateChanged = JSON.stringify(newState) !== JSON.stringify(currentNode.attrs.state)

          currentNode = updatedNode

          if (needsStateUpdate) {
              updateNodeAttributes({ state: newState });
          }

          const activeEl = document.activeElement
          const isPreviewFocused = activeEl && previewContainer.contains(activeEl);
          const isTextEditingFocused = isPreviewFocused && (
            activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable
          );

          // Update code editors if they are visible (normal code tab OR fullscreen)
          if (codeContainer.style.display !== 'none' || isFullscreen) {
            if (updatedNode.attrs.configGenerator !== configGenEditor.getValue()) {
              configGenEditor.setValue(updatedNode.attrs.configGenerator)
            }
            if (updatedNode.attrs.renderView !== renderViewEditor.getValue()) {
              renderViewEditor.setValue(updatedNode.attrs.renderView)
            }
          }
          
          // Update preview if we are in preview mode OR in fullscreen.
          // While a text input is focused we defer the re-render until blur
          // so typing does not lose caret. Button clicks (e.g. "+ Add plain
          // text" which focuses a BUTTON) must still re-render immediately
          // even though previewContainer remains focused — otherwise the
          // config generator appears stale despite state having updated.
          const shouldUpdatePreview = (codeContainer.style.display === 'none' || isFullscreen) && (stateChanged || configGenChanged);
          
          if (shouldUpdatePreview && !isTextEditingFocused) {
            renderPreviewConfig(updatedNode)
          } else if (shouldUpdatePreview && isTextEditingFocused) {
            const handleBlur = () => {
              if (!isDestroyed && (codeContainer.style.display === 'none' || isFullscreen)) {
                renderPreviewConfig(currentNode)
              }
            }
            activeEl.addEventListener('blur', handleBlur, { once: true })
          }

          // Keep the isolated render-view iframe in sync while fullscreen
          if (isFullscreen && (renderViewChanged || stateChanged)) {
            renderRenderViewPreview(updatedNode)
          }
          
          return true
        },
        destroy: () => {
          isDestroyed = true
          document.removeEventListener('keydown', handleFullscreenKeydown, true)
          configGenEditor.view.destroy()
          renderViewEditor.view.destroy()
        },
      }
    }
  },
})