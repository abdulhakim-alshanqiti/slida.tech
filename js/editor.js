import { Editor } from "https://esm.sh/@tiptap/core";
import StarterKit from "https://esm.sh/@tiptap/starter-kit";
import Placeholder from "https://esm.sh/@tiptap/extension-placeholder";
import CodeBlockLowlight from "https://esm.sh/@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "https://esm.sh/lowlight";
import { Markdown } from "https://esm.sh/tiptap-markdown";
import { t, i18nReady, onChange as onLangChange } from "./i18n.js";
import { HTMLRendererNode } from "./HTMLRendererNode.js";

const root = document.getElementById("editor-root");
const toolbar = document.getElementById("editor-toolbar");

/* "live" blocks are plain JS run against a container, so they should
   highlight exactly like a js/javascript fence. */
const lowlight = createLowlight(common);
lowlight.registerAlias({ javascript: "live" });

async function init() {
  await i18nReady; // placeholder text below needs a loaded dictionary

  let initialMarkdown = "";
  try {
    initialMarkdown = await window.initialMarkdownPromise;
  } catch (err) {
    initialMarkdown = "";
  }

  let diagramCode = "";
  try {
    diagramCode = await window.liveDiagramCodePromise;
  } catch (err) {
    diagramCode = "";
  }

  const editor = new Editor({
    element: root,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
      }),
      HTMLRendererNode,
      Placeholder.configure({ placeholder: t("editor.placeholder") }),
      Markdown.configure({ html: false, transformPastedText: true }),
    ],
    content: initialMarkdown,
    autofocus: false,
    onUpdate({ editor }) {
      const markdown = editor.storage.markdown.getMarkdown();
      window.onEditorMarkdownChange(markdown);
    },
    onSelectionUpdate: updateToolbarState,
    onTransaction: updateToolbarState,
  });

  // Placeholder text is baked in at construction time above, so refresh
  // it (and the ProseMirror editing direction) whenever the language
  // changes after startup.
  onLangChange(() => {
    try {
      editor.extensionManager.extensions.forEach((ext) => {
        if (ext.name === "placeholder") {
          ext.options.placeholder = t("editor.placeholder");
        }
      });
      editor.view.dispatch(editor.state.tr); // force a redraw of the empty-state placeholder
    } catch (err) {
      /* ignore */
    }
  });

  // app.js calls this when the user switches to a different file in
  // the filesystem, to load that file's markdown into the editor.
  window.slida.techEditor = editor;
  window.setEditorMarkdown = (markdown) => {
    try {
      editor.commands.setContent(markdown || "", true);
    } catch (err) {
      console.error("Failed to load file into editor", err);
    }
  };

  function updateToolbarState() {
    toolbar.querySelectorAll("[data-cmd]").forEach((btn) => {
      const cmd = btn.getAttribute("data-cmd");
      let active = false;
      try {
        if (cmd === "bold") active = editor.isActive("bold");
        else if (cmd === "italic") active = editor.isActive("italic");
        else if (cmd === "strike") active = editor.isActive("strike");
        else if (cmd === "code") active = editor.isActive("code");
        else if (cmd === "h1")
          active = editor.isActive("heading", { level: 1 });
        else if (cmd === "h2")
          active = editor.isActive("heading", { level: 2 });
        else if (cmd === "h3")
          active = editor.isActive("heading", { level: 3 });
        else if (cmd === "bulletList") active = editor.isActive("bulletList");
        else if (cmd === "orderedList") active = editor.isActive("orderedList");
        else if (cmd === "blockquote") active = editor.isActive("blockquote");
        else if (cmd === "link") active = editor.isActive("link");
      } catch (err) {
        /* ignore */
      }
      btn.classList.toggle("is-active", !!active);
    });
  }

  function runCmd(cmd) {
    const chain = editor.chain().focus();
    switch (cmd) {
      case "bold":
        chain.toggleBold().run();
        break;
      case "italic":
        chain.toggleItalic().run();
        break;
      case "strike":
        chain.toggleStrike().run();
        break;
      case "code":
        chain.toggleCode().run();
        break;
      case "h1":
        chain.toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        chain.toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        chain.toggleHeading({ level: 3 }).run();
        break;
      case "bulletList":
        chain.toggleBulletList().run();
        break;
      case "orderedList":
        chain.toggleOrderedList().run();
        break;
      case "blockquote":
        chain.toggleBlockquote().run();
        break;
      case "undo":
        chain.undo().run();
        break;
      case "redo":
        chain.redo().run();
        break;
      case "link": {
        const url = window.prompt(t("editorToolbar.linkPrompt"));
        if (url) chain.extendMarkRange("link").setLink({ href: url }).run();
        break;
      }
      case "hslide":
        chain.setHorizontalRule().run();
        break;
      case "vslide":
        chain.insertContent("--").run();
        break;
      case "quiz":
        chain.insertContent({ type: "htmlRenderer" }).run();
        break;
      case "diagram":
        chain.insertContent({ type: "htmlRenderer" }).run();
        break;
    }
  }

  toolbar.querySelectorAll("[data-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => runCmd(btn.getAttribute("data-cmd")));
  });

  updateToolbarState();
  window.onEditorMarkdownChange(editor.storage.markdown.getMarkdown());
}

init().catch((err) => {
  console.error("Tiptap failed to load", err);
  root.innerHTML =
    '<div class="tiptap-error">' +
    t("editor.loadError") +
    "<br>" +
    (err && err.message ? err.message : String(err)) +
    "</div>";
});
