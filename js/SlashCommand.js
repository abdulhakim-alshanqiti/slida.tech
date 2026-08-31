import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { t } from "./i18n.js";
import { liveblockExamples } from "./liveblockExamples.js";

function getItems() {
  return [
    {
      title: t("slashMenu.hslide"),
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      title: t("slashMenu.vslide"),
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).insertContent("--").run(),
    },
    ...liveblockExamples.map((ex) => ({
      title: ex.title,
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({ type: "htmlRenderer", attrs: ex.attrs })
          .run(),
    })),
    {
      title: t("slashMenu.h1"),
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run(),
    },
    {
      title: t("slashMenu.h2"),
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run(),
    },
    {
      title: t("slashMenu.h3"),
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run(),
    },
    {
      title: t("slashMenu.bulletList"),
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: t("slashMenu.orderedList"),
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
  ];
}

function filterItems(query) {
  const items = getItems();
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((item) => item.title.toLowerCase().includes(q));
}

// Minimal popup — same one from before, just wired to this file.
function createMenu() {
  const el = document.createElement("div");
  el.className = "slash-menu";
  document.body.appendChild(el);

  let items = [];
  let selectedIndex = 0;
  let onSelect = () => {};

  function render() {
    el.innerHTML = "";
    items.forEach((item, i) => {
      const row = document.createElement("div");
      row.className =
        "slash-menu-item" + (i === selectedIndex ? " is-selected" : "");
      row.textContent = item.title;
      row.addEventListener("mousedown", (e) => {
        e.preventDefault();
        onSelect(item);
      });
      el.appendChild(row);
    });
    el.style.display = items.length ? "block" : "none";
  }

  return {
    updateItems(newItems, select) {
      items = newItems;
      selectedIndex = 0;
      onSelect = select;
      render();
    },
    updatePosition(rect) {
      if (!rect) return;
      el.style.left = `${rect.left + window.scrollX}px`;
      // Position above the cursor: anchor to rect.top and flip the box
      // upward via transform, so it grows up regardless of menu height.
      el.style.top = `${rect.top + window.scrollY - 4}px`;
      el.style.transform = "translateY(-100%)";
    },
    moveSelection(delta) {
      if (!items.length) return;
      selectedIndex = (selectedIndex + delta + items.length) % items.length;
      render();
    },
    confirmSelection() {
      if (items[selectedIndex]) onSelect(items[selectedIndex]);
    },
    hide() {
      el.style.display = "none";
    },
    destroy() {
      el.remove();
    },
  };
}

const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        items: ({ query }) => filterItems(query),
        // props here is the selected item object ({ title, command }).
        // We call its own `command`, passing editor + range through —
        // this is what makes each item's `command` fn in getItems() fire.
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        render: () => {
          let menu;
          return {
            onStart: (props) => {
              menu = createMenu();
              menu.updateItems(props.items, (item) => props.command(item));
              menu.updatePosition(props.clientRect && props.clientRect());
            },
            onUpdate: (props) => {
              menu.updateItems(props.items, (item) => props.command(item));
              menu.updatePosition(props.clientRect && props.clientRect());
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                menu.hide();
                return true;
              }
              if (props.event.key === "ArrowDown") {
                menu.moveSelection(1);
                return true;
              }
              if (props.event.key === "ArrowUp") {
                menu.moveSelection(-1);
                return true;
              }
              if (props.event.key === "Enter") {
                menu.confirmSelection();
                return true;
              }
              return false;
            },
            onExit: () => {
              menu.destroy();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default SlashCommand;
