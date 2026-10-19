# Editing content

Everything visitors read lives in `index.html`. There is no CMS or data file: you edit the HTML and the layout adapts. This guide covers each kind of content, which markup to copy, and what to check afterwards.

After any edit, run the site locally ([installation.md](installation.md)) and look at it at a laptop size **and** a phone size (≤760px) before deploying.

---

## Projects

The Projects section is a horizontal track inside `<div class="track" id="track">`. In order, it holds:

1. **Main project cards** (`article.card.project`): large cards with an image.
2. **The "More Projects" strip** (`#more`) and its drawer (`#more-panel`) of small cards.
3. **The contact card** (`#contact`), always last.

### Add a main project card

Copy an existing `<article class="card project px-box">` block and paste it where you want the card to appear (cards show in source order). Then fill it in:

```html
<article class="card project px-box">
  <div class="thumb"><img src="assets/projects/my-project.webp" alt="Describe what the screenshot shows" width="960" height="320" loading="lazy" style="object-position: 50% 50%" /></div>
  <div class="card-body">
    <h3>My Project</h3>
    <p class="card-meta">Optional one-line context, e.g. internship · lab</p>   <!-- optional -->
    <p class="brief">One or two sentences on what it is.</p>
    <div class="card-section">
      <h4>Stack</h4>
      <ul class="tags"><li>TypeScript</li><li>React</li></ul>
    </div>
    <div class="card-section">
      <h4>Highlights</h4>
      <ul class="features">
        <li>Most important point first</li>
        <li>Second point</li>
        <li>…up to about five</li>
      </ul>
    </div>
    <a href="https://example.com" class="px-btn view" target="_blank" rel="noopener">View project →</a>
  </div>
</article>
```

**The bottom button.** Use one of these:
- a link: `<a href="…" class="px-btn view" target="_blank" rel="noopener">View project →</a>`
- a plain label when there's nothing to link to: `<span class="px-btn view static">Private repository</span>` (or `Private client project`)

**The image** (see [Preparing images](#preparing-images)):
- It's shown as a short banner, cover-cropped to the card's width. Use `style="object-position: X% Y%"` to choose which part stays visible (for example `20% 50%` keeps the left side).
- For diagrams that must not be cropped, add `thumb-fit` to the wrapper: `<div class="thumb thumb-fit">`. The whole image is then shown on a white background, and `object-position` isn't needed.
- Keep `width` / `height` equal to the file's real pixel size, so the browser reserves the right space.

**Length.** Laptop cards have a fixed height. If the content is too long, `fitCards()` in `script.js` trims it automatically, in this order:
1. It drops highlights from the end, down to two.
2. It switches every card to a tighter style.
3. It shortens the description to two lines, then one.

So put the most important highlights first, and expect the last ones to disappear on small laptop screens. Phones always show everything.

Nothing else needs to change. The track's scroll length is measured from the real card widths on every resize, so the section gets longer automatically.

### Update a main project
Edit the text, tags, link or image in its `<article>`. If you replace the image, update its `width` / `height`, and check the crop (`object-position`) at a laptop size.

### Remove a main project
Delete its whole `<article class="card project px-box">…</article>` block, and delete its image from `assets/projects/` if nothing else uses it.

### Small cards in the "More Projects" drawer

Each small card sits inside `<div class="more-grid">` and has a title, a short description, tags and a button. There's no image.

```html
<article class="mini-card px-box">
  <div class="mini-body">
    <h3>Project Name</h3>
    <p>One short sentence.</p>
    <ul class="tags"><li>Python</li><li>MQTT</li></ul>
    <a href="https://github.com/…" class="px-btn mini-view" target="_blank" rel="noopener">View project →</a>
    <!-- or: <span class="px-btn mini-view static">Private repository</span> -->
  </div>
</article>
```

- **Capacity.** On laptops the drawer is a fixed **3 × 2 grid**: five small cards plus the "Looking for more? / Go to my GitHub" card (`a.mini-card.more-cta`), which should stay last. That's full today.
  - To add a sixth project, remove one, or move it to the main cards.
  - Alternatively, change `.more-grid` in `style.css` from `repeat(3, …)` to `repeat(4, …)` columns. Then add a `.mini-card:nth-child(4n) { --col: 4; }` rule next to the existing `--col` rules; the slide-out animation uses these.
- **Length.** On laptops, `fitMinis()` shortens a description that doesn't fit (3 → 2 → 1 lines) and then drops tags from the end, down to two. Keep descriptions to one sentence.
- **Phones.** The drawer becomes one column, and each card drops in with a staggered delay. Those delays are defined for the first six cards only (`.mini-card:nth-child(1–6)` in the phone media query). If you go beyond six, extend them.

### Reorder
Move the `<article>` blocks. Keep the "More Projects" strip and drawer after the main cards, and the contact card last.

---

## Experience

The Experience section is `<section class="experience" id="experience">`. Each role is an `<li class="job">` inside `<ol class="jobs">`:

```html
<li class="job">
  <div class="job-top">
    <h3>Role Title</h3>
    <span class="job-when">Jun – Jul 2026</span>       <!-- optional -->
  </div>
  <p class="job-org">Organisation</p>
  <p class="job-project">Project – what it is</p>    <!-- optional, bold label for a sub-project -->
  <ul class="features">
    <li>What you did</li>
  </ul>
</li>
```

- **Layout.** On screens 1000px and wider, the list is a two-column grid. The role with `class="job job-main"` fills the whole left column; every other role stacks in the right column. Only one role should have `job-main`. Remove it to keep a single column.
- **Fit.** On laptops the card must fit one screen. `layout()` in `script.js` steps the text down (`.snug`, then `.tight`) until it fits. On very short screens it then scrolls the list inside the box, with an extra scroll stop. All of this is automatic.
  - More text means smaller type on more screens, so keep bullets short.
- **Source.** The entries mirror the Experience section of `assets/resume.pdf`. When one changes, update the other too.

---

## About, Skills and the hero

All three are inside `<section class="intro">`, in the `#stage` element:

| What | Where |
|---|---|
| Name, kicker, tagline | `.hero-left` (`<h1>`, `.kicker`, `.tagline`) |
| Right-hand blurb | `.hero-right` (marked `<!-- Change this -->`) |
| About text | `.panel.about` paragraphs (marked `<!-- Change this -->`) |
| Skills | `.panel.skills` `<dl>`: each `<dt>` is a group, its `<dd>` the list. Wrap a skill in `<strong>` to highlight it. |
| Portrait | `assets/avatar-torso.png` (52×90 pixel art; scaled up without smoothing) |

- The About and Skills panels are sized for roughly their current amount of text. If you add a lot more, check at 1366×768 and 800×600 that the panel still fits the screen.
- The `<h1>` font size is calculated for the 9 characters of "Nishit DB" (see `.hero-left h1` in `style.css`). A longer name needs that formula changed.
- When your skills change, update the `knowsAbout` list in the JSON-LD block in `<head>` too.

---

## Contact card and footer

In `article.contact-card`:

- **Email.** It's in the `mailto:` link **and** in the link text. Clicking the button copies the address taken from `href`, so keep both the same.
- **Social links.** These are `<li>` items in `ul.socials`.
- **Resume.** Replace `assets/resume.pdf` with a file of the same name.
- **"Last updated" date.** This is written by hand. When you publish changes, update both the visible text and the `datetime` attribute:
  ```html
  <time datetime="2026-10-19">19 October 2026</time>
  ```

---

## Navigation

There are two copies of the links in `<header class="topbar">`:

- `nav.main-nav`: the laptop/tablet bar (Projects · About · Skills · Experience · Contact).
- `nav.side-menu`: the phone sidebar.

If you add or rename a section, update **both**. Every `href="#id"` must match an element `id`. Links get the fade-and-jump automatically (any `a` inside `.topbar`).

`#contact` is special-cased in `navTarget()` (`script.js`), because the contact card sits at the end of the horizontal track rather than at a normal scroll position.

The laptop bar's link spacing shrinks on narrow screens to stay clear of the logo. If you add a sixth link, check at 761px wide that the bar doesn't overlap the logo.

---

## SEO and sharing metadata

All of it is in `<head>` of `index.html`:

| What | Where | Notes |
|---|---|---|
| Search snippet | `<meta name="description">`, plus `og:description` and `twitter:description` | Keep the three identical, about 150 characters |
| Title | `<title>`, `og:title`, `twitter:title` | |
| Link-preview image | `assets/og-image.jpg` (1200×630) | Referenced by `og:image` and `twitter:image` |
| Who the site is about | JSON-LD `Person` block | `image` points at `assets/nishit-d-b.jpg` (the headshot Google uses for name searches; not shown on the page), plus `affiliation`, `sameAs` (profile links) and `knowsAbout` (skills) |
| Sitemap | `sitemap.xml` | Update `<lastmod>` when content changes; it also lists the headshot |

After a significant change, request indexing for `https://nishit-db.com/` in Google Search Console (URL Inspection).

---

## Preparing images

Project screenshots are stored as WebP, **960px wide**, at quality ~78. They're never shown wider than about 483px, so this is sharp on high-DPI screens and keeps each file around 10–50 KB:

```bash
magick original.png -resize 960x -strip -quality 78 -define webp:method=6 assets/projects/my-project.webp
magick identify -format "%wx%h\n" assets/projects/my-project.webp   # use these for width/height
```

Other images:
- **Headshot** (`assets/nishit-d-b.jpg`): square, about 1200×1200 JPEG. Strip the metadata (`-strip`) so no camera or location data is published.
- **Logo / favicons:** `assets/logo-112.png` (navbar), `favicon.ico` (16/32/48), `assets/favicon-32.png`, `assets/favicon-192.png`, and `assets/apple-touch-icon.png` (180×180 on the site's grey `#3b3b3e`).

---

## Checklist before deploying

- [ ] Looks right at a laptop size (e.g. 1366×768) and a phone size (e.g. 390×844)
- [ ] Project cards: no text cut off mid-word; the image crop shows the right part
- [ ] Every new image has a real `width` / `height` and descriptive `alt` text
- [ ] Nav links in both `main-nav` and `side-menu` point at existing ids
- [ ] "Last updated" date and `sitemap.xml` `<lastmod>` bumped
- [ ] New asset files added to git (`git add assets/...`)
