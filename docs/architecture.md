# Architecture

A static page with three source files and no build step. The browser loads `index.html`, which pulls in `style.css` and `script.js`. Nothing is fetched at runtime apart from Google Fonts and the images.

```
index.html ── content + structure (every section, every card, SEO metadata)
   │
   ├── style.css ── visual states per section, desktop first, phone overrides ≤760px
   │
   └── script.js ── reads scroll / size → sets classes and CSS variables
```

Two layouts share the same markup:

| | Laptop / tablet (>760px) | Phone (≤760px) |
|---|---|---|
| Hero / About / Skills | One sticky "stage"; scroll position switches it between states | Plain vertical flow; the hero fades as About scrolls over it |
| Experience | Sticky box that slides in, holds, then shrinks and fades | Normal block that rises in |
| Projects | Pinned; vertical scroll moves a horizontal card track | Vertical list of cards |
| Navigation | Centred nav bar + logo | Logo + menu button opening a sidebar |
| Scroll stops | Yes (wheel, keyboard, touch) | No, native scrolling |

`layout()` sets the `vertical` flag from `window.innerWidth <= 760`, the same breakpoint as the CSS media query.

## Scroll timeline (laptop)

The page height is made of tall sections whose inner "pin" element is `position: sticky`. Scrolling through a tall section while its pin stays on screen is what drives each animation. `onScroll()` converts the scroll position into states.

**1. Intro** (`.intro`, 403.6vh tall; the sticky `#stage` inside). With `sv` = vh scrolled into the intro:

| sv | State |
|---|---|
| 0–30 | hero |
| 30–150 | `is-about`: portrait moves left, About panel slides in |
| 150–270 | `is-skills`: About leaves, Skills slides in |
| 270–294 | `--shrink` 0→1: the stage scales down and fades out |

**2. Experience** (`.experience`, `163.6vh + --exp-extra`).
- It's pulled up 60vh (`margin-top: -60vh`) so it rises in during the stage fade.
- It holds, then fades out the same way (`--exp-out`) between 30 and 54vh past its top.
- If the list doesn't fit the screen even at the smallest text size, the box keeps its height and its contents scroll inside it (`--exp-shift`) over `expExtra` px of extra section height.

**3. Projects** (`.projects`).
- Also pulled up 60vh, so its cards rise in (`.in`) halfway through the Experience fade.
- `layout()` sets the section's height to `vh + holdStart + travel + holdEnd`, where `travel` is the sum of the real card widths (plus the open drawer) needed to bring the contact card fully into view.
- `onScroll()` maps vertical scroll inside that range to `--track-x`.
- During the last card-width of travel, `--contact-in` fades the "Projects" heading out. `contact-done` then pops the "Contact Me" heading.

The 60vh overlaps and the fade windows are tuned so a section's exit and the next one's entrance overlap without ever leaving a blank screen. The heights and thresholds in `style.css` and `script.js` must change together; the comments next to each number say what it is paired with.

## Components in `script.js`

| Part | Responsibility |
|---|---|
| `layout()` | Breakpoint flag; phone hero pin offsets; Experience text-size tiers and inner scroll; card widths, track `travel`, section height; calls `fitCards()` |
| `fitCards()` / `fitMinis()` | Make fixed-height laptop cards fit by dropping highlights, applying `.tight` / `.clamp` / `.clamp1`, or trimming mini-card descriptions and tags. Re-run by a `ResizeObserver` on the track window |
| `onScroll()` | The timeline above; on phones, toggles `.in` on each element as it enters the view |
| "More Projects" drawer | `setMore()` toggles the drawer, which is a track item, so opening it adds its width to `travel` and lengthens the section |
| Nav fade-jump | Links in `.topbar` fade the page out, jump with animations disabled (`is-jumping`), then fade back in. `navTarget()` resolves each hash (`#contact` = end of the track) |
| Phone menu | `setMenu()`: sidebar, backdrop, Escape, focus handling |
| Scroll stops | Stops at: top, `#about`, `#skills`, Experience (plus its inner-scroll end, if any), Projects start. A wheel gesture (events < 200ms apart), arrow/page keys, or a >40px swipe moves exactly one stop with a 650ms glide. Inside Projects, scrolling is free |
| Sideways input | While Projects is pinned: trackpad side-swipes, Shift+wheel and horizontal touch drags become vertical scroll. They're clamped to the track's range, skip the holds at either end, and coast after a touch release |
| Copy email | Clicking the email button copies it (Clipboard API, `execCommand` fallback, `mailto:` as a last resort) |

## Styling conventions

- **Pixel primitives:** `.px-box` draws the pixel border and drop shadow with stacked `box-shadow`s; `--px` is one "pixel" (4px). `.px-btn` is the button style.
- **Design tokens** live on `:root`: colours (`--bg`, `--surface`, `--accent`, …), fonts, and the hero geometry (`--W`, `--av-h`, `--hero-gap`).
- **Section states** are classes (`is-about`, `is-skills`, `.in`, `contact-done`) or CSS variables (`--shrink`, `--exp-out`, `--track-x`, `--contact-in`) set from JS. Transitions are declared in CSS, so the JS never animates styles directly (the only exception is the scroll glide).
- **Reduced motion:** `prefers-reduced-motion` turns off transitions and animations in CSS. The JS skips the scroll glide and touch coasting.

## SEO layer

`<head>` carries the title, description, canonical URL, Open Graph / Twitter cards, a Google Search Console verification tag, and JSON-LD (`WebSite`, `ProfilePage`, `Person` with image, affiliation, `sameAs`, `knowsAbout`). `robots.txt` allows everything and points to `sitemap.xml`, which lists the homepage and the headshot image.
