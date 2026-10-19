# Structure

```
.
├── index.html                  # the whole site: content, structure, SEO metadata
├── style.css                   # all styles (desktop first; phone overrides in @media (max-width: 760px))
├── script.js                   # all behaviour (no modules, loaded at the end of <body>)
├── favicon.ico                 # 16/32/48 browser icon
├── robots.txt                  # allow all, points to the sitemap
├── sitemap.xml                 # homepage + headshot image entry
├── assets/
│   ├── avatar-torso.png        # 52×90 pixel-art portrait (hero, and About on phones)
│   ├── logo-112.png            # navbar logo (top left)
│   ├── favicon-32.png          # PNG favicons
│   ├── favicon-192.png
│   ├── apple-touch-icon.png    # 180×180 iOS home-screen icon
│   ├── og-image.jpg            # 1200×630 link-preview image (social shares)
│   ├── nishit-d-b.jpg          # headshot for Google (JSON-LD/sitemap only, not shown on the page)
│   ├── resume.pdf              # linked from the contact card
│   └── projects/               # main project card screenshots, 960px-wide WebP
│       ├── dbase.webp
│       ├── cabo.webp
│       ├── car-simulator.webp
│       ├── agritech.webp
│       └── agentsecurebench.webp
├── docs/                       # this documentation
└── .claude/launch.json         # local dev-server config (python http.server on :5173)
```

## `index.html`, top to bottom

| Block | Contents |
|---|---|
| `<head>` | Title, description, canonical, icons, Open Graph / Twitter, JSON-LD, Search Console tag, fonts, `style.css` |
| `header.topbar` | Logo (`.brand`, links to `#top`), `nav.main-nav` (laptop), `.menu-btn` + `.menu-backdrop` + `nav.side-menu` (phone) |
| `section.intro#top` | `#about` / `#skills` anchors (scroll-stop and nav targets), `#stage`: hero text, portrait, About panel, phone-only second portrait, Skills panel |
| `section.experience#experience` | Heading + `ol.jobs` of `li.job` roles |
| `section.projects#projects` | `.projects-pin` → heading → `.track-window` → `#track`: project cards, "More Projects" strip + drawer, contact card |
| end of `<body>` | `<script src="script.js">` |

## Where things go

- **Content changes** belong in `index.html` only. See [usage.md](usage.md).
- **`style.css`** has one block per section, in page order, and the phone media query near the end. Keep phone-specific rules inside that query rather than adding new breakpoints. 760px is also hard-coded in `script.js`.
- **`script.js`** should hold behaviour, not content. Anything a visitor reads should stay out of it (the only strings in it are ARIA labels and the "Copied to clipboard!" message).
- **`assets/projects/`** is only for main-card screenshots. The small "More Projects" cards have no images.
- Unused assets are deleted rather than kept around: everything in `assets/` is referenced by the page, the metadata or the sitemap.
