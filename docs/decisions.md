# Technical decisions

## Static HTML/CSS/JS with no build step
The site is one page whose content changes a few times a term. A framework or bundler would add a toolchain to maintain and a build to wait for, without solving a real problem here. Hand-written HTML also gives exact control over the markup that search engines and link previews read. The cost is that content and structure are mixed in `index.html`, so editing means copying HTML blocks ([usage.md](usage.md)) instead of filling in a data file.

## Content in HTML, not generated from JSON
Rendering cards from a JSON file in `script.js` was the obvious alternative. It was rejected because:
- crawlers and link previews would see an empty page until JavaScript ran
- the fitting logic needs real DOM elements to measure anyway
- with about ten projects, duplication is small

## Scroll-driven sections built on `position: sticky`
Each laptop section is a tall block whose inner pin is sticky; scroll position, not time, drives the transitions. This keeps the native scrollbar, keyboard scrolling and browser history working. No scroll-hijacking library is used, and a quick scroll can never leave an animation half-finished.

The trade-off is coupling: section heights (CSS) and timeline thresholds (JS) must be kept in step. The comments in both files spell out which numbers belong together.

## Overlapping sections (`margin-top: -60vh`)
Experience and Projects are pulled up over the end of the previous section, so the next section rises in while the previous one is still fading out. Without the overlap there was a stretch of empty tarmac between sections.

## Scroll stops on laptops, native scrolling on phones
A hard trackpad swipe used to fly straight past About and Skills. Scroll stops group wheel events into gestures (gaps over 200ms start a new gesture) and move exactly one stop per gesture, with a short eased glide. They only apply above the Projects section, where every section is a full-screen frame. Inside Projects, scrolling stays free so the track can be scrubbed. Phones keep native momentum scrolling, because the content there is a normal vertical page.

## Measuring instead of hard-coding the track
The horizontal track's length comes from summed `getBoundingClientRect()` widths (fractional, since `offsetWidth` rounds) plus the open drawer. Adding, removing or resizing a card never needs a number changed.

## Fitting content by trimming, not scrolling
Laptop cards have a fixed height so the row stays even and a whole card is always in view. When text doesn't fit, `fitCards()` drops content in a fixed order of importance (trailing highlights, then a tighter style for every card at once, then line clamps) instead of adding inner scrollbars. Applying `.tight` to every card together means a row never mixes two styles. Phones show everything, since vertical space isn't limited there.

Experience does the reverse, because it should show everything: it steps the text size down, and only as a last resort scrolls the list inside its box, with an extra scroll stop.

## The "More Projects" drawer is part of the track
An earlier overlay-style drawer closed itself unpredictably as the track moved. Making the drawer a track item that grows from zero width means opening it physically lengthens the section, and its cards are simply further along. It only closes when its strip is clicked again.

## Sideways input converted to vertical scroll
The track moves with vertical scroll, so trackpad side-swipes, Shift+wheel and horizontal touch drags are translated into vertical scroll while the section is pinned. These moves are clamped to the track's range, so a swipe past either end can't carry the page out of the section. Outside that range sideways input isn't handled at all. The clamp also skips the holds at each end, so a sideways swipe always moves the cards.

## Pixel-art look from CSS, not images
Borders and shadows are stacked `box-shadow`s (`.px-box`) and the speech-bubble tail is a stepped `clip-path`. Only the portrait and logo are bitmaps. This keeps the page light and lets the "pixels" scale with the layout.

## Images: small WebP, real dimensions
Project screenshots are 960px WebP (twice the largest displayed width) at about q78, with `width` / `height` attributes to prevent layout shift, and `loading="lazy"`, since they're off screen at first. Favicons and the logo are palette-reduced PNGs.

## SEO choices
- JSON-LD `Person`, `ProfilePage` and `WebSite` with `sameAs` links and an affiliation, to tie the name to the right person.
- A real headshot (`assets/nishit-d-b.jpg`) is referenced from JSON-LD and the image sitemap, but not shown on the page, which keeps the pixel-art design.
- The pixel-art banner stays as the link-preview image (`og-image.jpg`), by choice.
- The "Last updated" date is written by hand. Generating it from the visitor's clock would always show today's date.
