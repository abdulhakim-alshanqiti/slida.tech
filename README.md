# Slida.tech

**Markdown → interactive presentations**

https://github.com/user-attachments/assets/dfcc3199-eb5e-4360-8da9-076a4b4bfd79




Slida.tech is a lightweight, browser-based presentation editor for creating interactive slides with **Markdown** and **Reveal.js**.

Write your presentation in Markdown, see the result instantly, customize the Reveal.js theme, and add interactive content such as quizzes, diagrams, charts, and live JavaScript components — all from one workspace.

try the alpha version out now : https://slida-tech.pages.dev/

## ✨ Features

* 📝 **Markdown-based slide editing**
  * Write slides using familiar Markdown syntax.
  * Create headings, lists, quotes, links, code, and more.
  * Add horizontal and vertical slides directly from the editor.

* 👀 **Live presentation preview**
  * Edit your Markdown and see the presentation update instantly.
  * Navigate through slides without losing your current position.
  * Present the deck in fullscreen.

* 🎨 **Live Reveal.js theme editor**
  * Edit the presentation CSS directly in the browser.
  * Import your own `.css` theme.
  * Export the current theme.
  * Reset to the default theme.
  * Changes are applied live.

* 🧩 **Interactive content**
  * Create interactive quizzes.
  * Build interactive diagrams.
  * Embed executable JavaScript components.
  * Create visualizations and educational demonstrations.

* 📊 **Charts and visualizations**
  * Supports interactive visualizations through libraries such as Apache ECharts.
  * Useful for presentations containing data, dashboards, and demonstrations.

* 🌐 **Internationalization**
  * English interface.
  * Arabic interface.
  * Built-in language switching.

* 📁 **Multiple Markdown files**
  * Work with multiple presentation files.
  * Create new files directly from the editor.

* 📥 **Export**
  * Download the Markdown source.
  * Download a standalone HTML presentation.
  * Export the customized Reveal.js theme CSS.

## 🖥️ Interface

The application uses a split workspace view:

```text
┌─────────────────────────────────────────────────────────────┐
│  Manuscript                       Theme   Present  Lang     │
├────────────────────────────┬────────────────────────────────┤
│                            │                                │
│         Editor             │            Preview             │
│                            │                                │
│  Markdown / Formatting     │       Reveal.js Slides         │
│  Toolbar                   │                                │
│  Files                     │                                │
│                            │                                │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

The editor and presentation preview are kept side-by-side so that you can author and review your slides without switching between applications.

## 📝 Markdown Slides

Slides are authored using Markdown.

A simple presentation can look like:

```markdown
# Welcome

This is my presentation.

---

# Second Slide

- First point
- Second point
- Third point

---

## Another Slide

Your content here.
```

Horizontal rules (`---`) are used to separate slides.

Vertical slides can also be created for nested presentation content.

## 🧠 Interactive Blocks

Slida.tech extends normal Markdown presentations with executable interactive blocks.

For example, an interactive quiz can be embedded into a presentation:

```htmlrenderer
{
  "configGenerator": "...",
  "renderView": "..."
}
```

These blocks can contain a configuration/editor view as well as the code used to render the final interactive component.

This makes it possible to create presentations that are more than static slides.

### Example use cases

- Interactive quizzes
- Educational demonstrations
- Mathematical visualizations
- Interactive diagrams
- Data visualizations
- JavaScript demonstrations
- Small UI experiments

## 📊 Interactive Visualizations

The project can be used to build slides containing interactive data visualizations.

For example, a slide can initialize an ECharts visualization:

```htmlrenderer
const chart = LiveKit.el('div', {
  style: {
    width: '100%',
    height: '340px'
  }
});

const chartDiv = LiveKit.el('div', {
  style: {
    width: '100%',
    height: '340px'
  }
});

chart.appendChild(chartDiv);
container.appendChild(chart);

const myChart = echarts.init(chartDiv);

myChart.setOption({
  xAxis: {
    type: 'category',
    data: ['2002', '2004', '2006', '2008', '2010']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'line',
      data: [0, 8, 22, -12, 15]
    }
  ]
});
```

This makes Slida.tech particularly useful for technical, educational, and data-oriented presentations.

## 🧩 Live Components

Slida.tech provides a small `LiveKit` API for constructing interactive components.

For example:

```htmlrenderer
const button = LiveKit.el('button', {
  style: {
    padding: '12px 20px',
    borderRadius: '8px'
  }
}, 'Click me');

container.appendChild(button);
```

Components can attach normal browser event handlers and update the DOM dynamically.

The repository also contains `live-diagram.js`, which provides functionality for interactive diagram content.

## 🎨 Theme Customization

Presentation styling is not locked to a single theme.

Open **Theme CSS** to:

1. Edit the current Reveal.js theme.
2. See changes immediately.
3. Import another `.css` file.
4. Save/export the current theme.
5. Restore the default theme.

This allows users to create their own presentation design without modifying the application source code.

The application explicitly exposes this functionality through its Theme CSS interface.

## 🌍 Arabic Support

The interface includes internationalization support and can be switched between English and Arabic.

The application also includes support for Arabic typography through its font configuration and localization files.

## 🏗️ Project Structure

```text
slida.tech/
├── css/
│   └── app.css
│
├── i18n/
│   └── ...
│
├── js/
│   ├── app.js
│   ├── editor.js
│   └── i18n.js
│
├── index.html
├── live-diagram.js
├── public/
│   ├── reveal-theme.css  # bundled theme + slides served by Vite
│   └── slides.md
└── vite.config.js
```

The repository is currently organized as a client-side web application with the editor, application logic, localization, styling, Reveal.js theme, and presentation content separated into their respective files/directories.

## 🚀 Getting Started

Slida.tech is a client-side application, so there is no traditional backend required to run the editor.

Clone the repository:

```bash
git clone [https://github.com/abdulhakim-alshanqiti/slida.tech.git](https://github.com/abdulhakim-alshanqiti/slida.tech.git)
cd slida.tech
```

Then serve the directory using any static web server.

For example:

```bash
python -m http.server 8080
```

Open:

```text
http://localhost:8080
```

> Using a local HTTP server is recommended instead of opening `index.html` directly because the application uses JavaScript modules and browser-based resources.

## 🛠️ Technology

Slida.tech is built around web standards and browser-based technologies.

### Core

* HTML
* CSS
* JavaScript
* ES Modules
* Markdown

### Presentation

* [Reveal.js](https://revealjs.com/)

### Visualization

* [Apache ECharts](https://echarts.apache.org/)

### Interactive components

* `LiveKit`
* Native DOM APIs
* JavaScript modules

### Typography

* Inter
* Fraunces
* JetBrains Mono
* Noto Sans Arabic

## 📦 No Build Step

The project is intentionally lightweight and primarily consists of static HTML, CSS, JavaScript, and Markdown files.

This makes it possible to run and deploy the project using a standard static web server.

It can also be hosted on platforms such as:

* GitHub Pages
* Cloudflare Pages
* Netlify
* Vercel
* Any static web server

## 🎯 Use Cases

Slida.tech can be useful for:

* 👨‍🏫 Teaching and lectures
* 💻 Technical presentations
* 📚 Educational content
* 📊 Data presentations
* 🧪 Interactive demonstrations
* 🧮 Mathematics visualizations
* 🧑‍💻 Programming tutorials
* 🎤 Conference presentations
* 📝 Markdown-based slide authoring

## 💡 Why Markdown?

Traditional presentation software often separates content from the developer workflow.

Slida.tech takes a different approach:

```text
Markdown
    ↓
Slide Structure
    ↓
Reveal.js
    ↓
Interactive Presentation
```

This makes presentations easy to:

* Version-control with Git
* Edit as plain text
* Generate programmatically
* Share as Markdown
* Embed interactive JavaScript
* Customize with CSS

## 🤝 Contributing

Contributions, ideas, bug reports, and improvements are welcome.

1. Fork the repository.
2. Create a branch:

```bash
git checkout -b feature/my-feature
```

3. Make your changes.
4. Commit them:

```bash
git commit -m "Add my feature"
```

5. Push the branch:

```bash
git push origin feature/my-feature
```

6. Open a Pull Request.

## 🐛 Issues

If you find a bug or have an idea for improving Slida.tech, open an issue on GitHub.

Please include:

* What you expected to happen
* What actually happened
* Steps to reproduce the problem
* Browser and operating system
* Screenshots or example Markdown when relevant

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## ⭐ Project

**Slida.tech** — a Markdown-first editor for creating interactive Reveal.js presentations.

Repository:

https://github.com/abdulhakim-alshanqiti/slida.tech

---

Built with Markdown, JavaScript, and Reveal.js.
