# Installation

## Prerequisites
- Any static file server. The examples use Python 3's built-in one.
- A modern browser.
- Optional: [ImageMagick 7](https://imagemagick.org) (`magick`), for preparing images ([usage.md](usage.md#preparing-images)).

There are no packages, environment variables or databases.

## Run locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Crossbow2560/web-portfolio.git
   cd web-portfolio
   ```
2. Serve the folder:
   ```bash
   python3 -m http.server 5173
   ```
   (Claude Code's preview uses the same command, configured in `.claude/launch.json`.)
3. Open http://localhost:5173.

Use a server rather than opening `index.html` as a file. Absolute paths such as `/favicon.ico` only resolve correctly over HTTP, and copy-to-clipboard needs a secure context (HTTPS or `localhost`).

## Verify it works
- The hero slides in on load, and scrolling steps through About → Skills → Experience → Projects.
- In Projects, scrolling down moves the cards sideways and ends on the contact card.
- At a phone width (≤760px, e.g. with the browser's device toolbar), the page is a vertical list and the top-right button opens the sidebar menu.
- The browser console shows no errors.

## Deploy
The live site, https://nishit-db.com, is served by Vercel as plain static files; the repo has no build configuration. Commit and push to `main`:

```bash
git add -A
git commit -m "Update portfolio content"
git push origin main
```

After a content change, also:
- bump the "Last updated" date and `sitemap.xml` `<lastmod>` ([usage.md](usage.md#contact-card-and-footer))
- request indexing of `https://nishit-db.com/` in Google Search Console for faster search updates
