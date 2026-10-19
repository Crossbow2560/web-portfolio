# Nishit D B — Portfolio

## 📚 Documentation
| | |
|---|---|
| [📖 Editing content](docs/usage.md) | Add, update or remove projects, experience, skills and other portfolio data |
| [⚙️ Architecture](docs/architecture.md) | How the scroll-driven page is put together |
| [📁 Structure](docs/structure.md) | What each file and asset is for |
| [🚀 Installation](docs/installation.md) | Run it locally and deploy it |
| [🧠 Technical decisions](docs/decisions.md) | Why it's built this way |

---

## Description
A single-page, pixel-art personal portfolio served at **https://nishit-db.com**. It's a static site: one HTML page, one stylesheet and one script, with no build step and no dependencies.

On laptops the page is one scroll-driven story: hero → About → Skills → Experience → Projects (a horizontal track that moves as you scroll down) → Contact. Scroll stops make each section land in place. On phones (≤760px wide) it becomes a normal vertical page with a sidebar menu.

All content (projects, experience, skills, contact details) is written directly in `index.html`. The layout code fits whatever is there, so most updates are HTML edits only. See **[docs/usage.md](docs/usage.md)**.

## Quick start
```bash
git clone https://github.com/Crossbow2560/web-portfolio.git
cd web-portfolio
python3 -m http.server 5173
```
Open http://localhost:5173.

## Technologies used
- **Markup / content:** HTML5, schema.org JSON-LD, Open Graph / Twitter meta
- **Styling:** plain CSS (custom properties, sticky positioning, grid / flex), Google Fonts (Press Start 2P, JetBrains Mono)
- **Behaviour:** vanilla JavaScript (no framework, no bundler)
- **Hosting:** Vercel, serving the repository as static files

## Quick installation
1. Clone the repo.
2. Serve the folder with any static file server (for example `python3 -m http.server 5173`).
3. Open it in a browser.

Details: [docs/installation.md](docs/installation.md)

## Architecture (summary)
`index.html` holds every section and all the content. `style.css` defines each section's states (hidden, sliding in, shown, fading out). `script.js` reads the scroll position and toggles those states, measures cards so their content fits, and adds scroll stops, sideways-swipe handling, the phone menu and nav fades. More in [docs/architecture.md](docs/architecture.md).

## Project structure
```
.
├── index.html        # all content + SEO metadata
├── style.css         # all styling, desktop first, phone overrides at ≤760px
├── script.js         # scroll timeline, card fitting, scroll stops, menus
├── assets/           # images, icons, resume
│   └── projects/     # project card screenshots (.webp)
├── favicon.ico
├── robots.txt
└── sitemap.xml
```
Details: [docs/structure.md](docs/structure.md)
