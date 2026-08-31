import { Editor } from "https://esm.sh/@tiptap/core@2.4.0";
import StarterKit from "https://esm.sh/@tiptap/starter-kit@2.4.0";
import Placeholder from "https://esm.sh/@tiptap/extension-placeholder@2.4.0";
import CodeBlockLowlight from "https://esm.sh/@tiptap/extension-code-block-lowlight@2.4.0";
import { createLowlight, common } from "https://esm.sh/lowlight@3.1.0";
import { Markdown } from "https://esm.sh/tiptap-markdown@0.8.10";
import { t, i18nReady, onChange as onLangChange } from "./i18n.js";
import { HTMLRendererNode } from "./HTMLRendererNode.js";
import SlashCommand from "./SlashCommand.js";

const root = document.getElementById("editor-root");
// toolbar element/listeners removed

const lowlight = createLowlight(common);
lowlight.registerAlias({ javascript: "live" });

async function init() {
  await i18nReady;

  let initialMarkdown = "";
  try {
    initialMarkdown = await window.initialMarkdownPromise;
  } catch (err) {
    initialMarkdown = "";
  }

  const editor = new Editor({
    element: root,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
      HTMLRendererNode,
      Placeholder.configure({ placeholder: t("editor.placeholder") }),
      Markdown.configure({ html: false, transformPastedText: true }),
      SlashCommand,
    ],
    content: initialMarkdown,
    autofocus: false,
    onUpdate({ editor }) {
      window.onEditorMarkdownChange(editor.storage.markdown.getMarkdown());
    },
  });

  onLangChange(() => {
    try {
      editor.extensionManager.extensions.forEach((ext) => {
        if (ext.name === "placeholder") {
          ext.options.placeholder = t("editor.placeholder");
        }
      });
      editor.view.dispatch(editor.state.tr);
    } catch (err) {
      /* ignore */
    }
  });

  window.slida_techEditor = editor;
  window.setEditorMarkdown = (markdown) => {
    try {
      editor.commands.setContent(markdown || "", true);
    } catch (err) {
      console.error("Failed to load file into editor", err);
    }
  };

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
