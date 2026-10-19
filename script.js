const intro = document.querySelector(".intro");
const stage = document.getElementById("stage");
const projects = document.getElementById("projects");
const pin = projects.querySelector(".projects-pin");
const track = document.getElementById("track");
const head = projects.querySelector(".projects-head");
const contact = document.getElementById("contact");

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Horizontal-scroll geometry, recomputed on resize.
let travel = 0;     // px the track moves sideways
let holdStart = 0;  // px of vertical scroll before the track starts moving
let lastStep = 1;   // px of the final slide that brings the contact card in
let vertical = false; // phones: plain vertical list instead of the horizontal track
let trackX = 0;         // current sideways position of the track
let moreOpen = false;   // "More Projects" drawer open (it lengthens the track)

function layout() {
  const vw = pin.clientWidth;          // excludes the scrollbar
  const bp = window.innerWidth;        // matches CSS media queries
  const vh = window.innerHeight;

  vertical = bp <= 760;  // matches the phone media query in style.css
  projects.classList.toggle("is-vertical", vertical);
  // Phones: pin each hero piece at the spot it naturally occupies at the top of the
  // page (the intro starts at y = 0, so that's its margin plus everything above it).
  const heroEls = [".hero-left", ".hero-right", ".avatar:not(.avatar-about)"].map((s) => stage.querySelector(s));
  if (vertical) {
    let y = 0;
    for (const el of heroEls) {
      y += parseFloat(getComputedStyle(el).marginTop);
      el.style.setProperty("--stick-top", `${y}px`);
      y += el.offsetHeight;
    }
    // About starts just below the first screen, so it slides in from the bottom
    stage.style.setProperty("--about-gap", `${Math.max(72, window.innerHeight - y)}px`);
  } else {
    stage.style.removeProperty("--about-gap");
    for (const el of heroEls) el.style.removeProperty("--stick-top");
    stage.style.removeProperty("--hero-fade");
    stage.classList.remove("hero-gone");
  }

  if (vertical) {
    fitCards();
    travel = 0;
    projects.style.height = "";
    track.style.removeProperty("--track-x");
    pin.style.removeProperty("--contact-in");
    return;
  }

  const pad = clamp(bp * 0.04, 16, 48);
  const content = Math.min(vw, 1600) - 2 * pad;
  const gap = bp <= 760 ? 16 : 28;
  const perView = bp >= 1100 ? 3 : bp > 760 ? 2 : 1.15;
  const cardW = (content - (perView - 1) * gap) / perView;

  track.style.setProperty("--card-gap", `${gap}px`);
  track.style.setProperty("--card-w", `${cardW}px`);
  track.style.setProperty("--contact-w", `${content}px`); // three card spaces on desktop
  pin.style.setProperty("--window-w", `${content}px`);

  // Sideways distance until the contact card fills the window exactly: everything
  // before it, card by card (the "More Projects" strip is narrower than a card).
  travel = [...track.querySelectorAll(".card:not(.contact-card)")]
    .reduce((sum, card) => sum + card.getBoundingClientRect().width + gap, 0);  // fractional: offsetWidth rounds
  // the open drawer fills the window beside the strip; use its final width, as it animates
  if (moreOpen) {
    const drawerW = content - more.getBoundingClientRect().width - gap;
    travel += drawerW + gap;
  }
  lastStep = cardW + gap;
  holdStart = vh * 0.15;
  const holdEnd = vh * 0.25;
  projects.style.height = `${vh + holdStart + travel + holdEnd}px`;
  fitCards();
}

// Laptops: project cards have a fixed height, so a card whose content doesn't fit
// trims itself, stopping as soon as it fits: highlights are dropped from the end
// (down to two) before anything else, so the description stays whole. If a card
// still doesn't fit, every project card switches to the tighter .tight style
// together (so a row never mixes styles) and the highlights are fitted again; only
// a card that still overflows then gets its description capped (.clamp, then .clamp1)
// and, on the very smallest screens, may drop to a single highlight.
// Phones show everything (cards grow to fit there).
function fitCards() {
  const cards = [...track.querySelectorAll(".card.project")];
  const fit = (card, min = 2) => {
    const body = card.querySelector(".card-body");
    const btn = card.querySelector(".view");
    const items = [...card.querySelectorAll(".features li")];
    items.forEach((li) => li.classList.remove("is-cut"));
    // scrollHeight ignores the bottom padding here, so test the button's real edge
    const overflows = () =>
      btn.getBoundingClientRect().bottom >
      body.getBoundingClientRect().bottom - parseFloat(getComputedStyle(body).paddingBottom) + 0.5;
    for (let n = items.length; overflows() && n > min; n--) items[n - 1].classList.add("is-cut");
    return !overflows();
  };
  fitMinis();
  cards.forEach((card) => card.classList.remove("tight", "clamp", "clamp1"));
  if (vertical) { cards.forEach((card) => card.querySelectorAll(".is-cut").forEach((li) => li.classList.remove("is-cut"))); return; }
  if (!cards.map(fit).every(Boolean)) {
    cards.forEach((card) => card.classList.add("tight"));
    // last resorts, per card: cap the description at two lines, then one line, then
    // allow a single highlight (only the smallest laptop screens get this far)
    cards.forEach((card) => {
      if (fit(card)) return;
      card.classList.add("clamp");
      if (fit(card)) return;
      card.classList.add("clamp1");
      if (!fit(card)) fit(card, 1);
    });
  }
}

// The "More Projects" drawer's small cards get the same treatment on laptops: if one
// doesn't fit, its description is shortened (3 → 2 → 1 lines), then tags are dropped
// from the end (down to two). Phones show everything.
function fitMinis() {
  for (const card of document.querySelectorAll("#more-panel .mini-card:not(.more-cta)")) {
    const body = card.querySelector(".mini-body");
    const btn = card.querySelector(".mini-view");
    const tags = [...card.querySelectorAll(".tags li")];
    card.classList.remove("d3", "d2", "d1");
    tags.forEach((li) => li.classList.remove("is-cut"));
    if (vertical) continue;
    const overflows = () =>
      btn.getBoundingClientRect().bottom >
      body.getBoundingClientRect().bottom - parseFloat(getComputedStyle(body).paddingBottom) + 0.5;
    for (const lines of ["d3", "d2", "d1"]) {
      if (!overflows()) break;
      card.classList.remove("d3", "d2", "d1");
      card.classList.add(lines);
    }
    for (let n = tags.length; overflows() && n > 2; n--) tags[n - 1].classList.add("is-cut");
  }
}

// Re-fit the cards whenever the card area changes size (e.g. the heading's web font
// loading shrinks it), not only on window resizes.
new ResizeObserver(() => fitCards()).observe(track.parentElement);

function onScroll() {
  const vh = window.innerHeight;

  // Phones: everything is a plain vertical page. Each section (hero text, portraits,
  // About, Skills, the Projects heading and every card) rises in as it scrolls into view.
  if (vertical) {
    stage.classList.remove("is-about", "is-skills");
    stage.style.removeProperty("--shrink");
    stage.style.visibility = "";
    // hero → About: the hero fades from full as About's top enters at the bottom of
    // the screen, to gone when it's 40% of the way down — before About's portrait
    // reaches the hero portrait, so the faded hero never shows through it.
    const aboutTop = stage.querySelector(".about").getBoundingClientRect().top;
    const fade = clamp((aboutTop - vh * 0.4) / (vh * 0.6), 0, 1);
    stage.style.setProperty("--hero-fade", fade.toFixed(3));
    stage.classList.toggle("hero-gone", fade < 0.05);
    for (const el of [...stage.children, head, ...track.children])
      el.classList.toggle("in", el.getBoundingClientRect().top < vh * 0.92);
    // dead end: the contact card is fully on screen
    const c = contact.getBoundingClientRect();
    pin.classList.toggle("contact-done", c.top >= 0 && c.bottom <= vh + 1);
    return;
  }

  // Frames 1 → 2 → 3: hero, about, skills, then fade the stage out completely.
  // Timeline in vh scrolled through the intro (403.6vh tall, 303.6vh scrollable):
  //   0–30 hero · 30–150 about · 150–270 skills · 270–294 fade · 294–303.6 tail
  // Scroll stops (below) sit at 0, 90 (about), 210 (skills) and the projects' start.
  // The fade ends 9.6vh before the intro does, which the projects crossfade relies on.
  const sv = (-intro.getBoundingClientRect().top / vh) * 100;
  stage.classList.toggle("is-about", sv > 30);
  stage.classList.toggle("is-skills", sv > 150);
  const shrink = clamp((sv - 270) / 24, 0, 1);
  stage.style.setProperty("--shrink", shrink.toFixed(3));
  stage.style.visibility = shrink >= 1 ? "hidden" : "";

  // Frame 3: cards rise in, then vertical scroll drives them sideways.
  const top = projects.getBoundingClientRect().top;
  projects.classList.toggle("in", top < vh * 0.6);  // undone when scrolling back up
  let x = clamp(-top - holdStart, 0, travel);
  if (travel - x < 1) x = travel;  // fractional scroll positions can stop a hair short
  track.style.setProperty("--track-x", x.toFixed(1));
  trackX = x;
  // the header fades out during the last slide, as the contact card comes in
  pin.style.setProperty("--contact-in", clamp((x - (travel - lastStep)) / lastStep, 0, 1).toFixed(3));
  // dead end: the contact card has fully slid in
  pin.classList.toggle("contact-done", travel > 0 && x >= travel - 1);
}

// "More Projects" drawer. It's an item in the track, so opening it physically lengthens
// the projects section (layout() adds its width) and you scroll on through its cards to
// the contact card. Only the strip itself opens and closes it. On laptops, opening also
// scrolls the strip to the left edge of the card window so the drawer unfolds in view.
const more = document.getElementById("more");
const moreToggle = more.querySelector(".more-toggle");

function setMore(open) {
  moreOpen = open;
  more.classList.toggle("is-open", open);
  moreToggle.setAttribute("aria-expanded", String(open));
  layout();     // new scroll length (closing never moves the strip: it's still within range)
  onScroll();
}

moreToggle.addEventListener("click", () => {
  if (moreOpen) return setMore(false);
  setMore(true);
  if (vertical) return;
  const edge = track.parentElement.getBoundingClientRect().left + 16;  // window's content edge
  const stripX = clamp(trackX + more.getBoundingClientRect().left - edge, 0, travel);
  if (Math.abs(stripX - trackX) > 1)
    window.scrollTo({
      top: projects.offsetTop + holdStart + stripX,
      behavior: reduceMotion.matches ? "instant" : "smooth",
    });
});

// Where each nav link lands. Contact lives at the end of the horizontal track
// (laptops) or the end of the list (phones), so it isn't a plain anchor jump.
function navTarget(hash) {
  if (hash === "#contact")
    return vertical
      ? contact.getBoundingClientRect().top + window.scrollY - 140
      : projects.offsetTop + projects.offsetHeight - window.innerHeight;
  const el = document.querySelector(hash);
  // respect scroll-margin-top (the phone anchors use it to land clear of the nav)
  return el
    ? el.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)
    : null;
}

// Nav clicks: fade the page content out (the nav stays), jump, fade back in.
const FADE_MS = 300;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let navRun = 0;  // a newer click cancels an older one mid-fade

document.querySelectorAll(".topbar nav a").forEach((a) =>
  a.addEventListener("click", async (e) => {
    const hash = a.getAttribute("href");
    if (navTarget(hash) === null) return;
    e.preventDefault();
    const run = ++navRun;
    const root = document.documentElement;
    if (!reduceMotion.matches) {
      root.classList.add("is-faded");
      await wait(FADE_MS);
      if (run !== navRun) return;
    }
    // jump with the sections' own animations off, so they land already settled
    root.classList.add("is-jumping");
    window.scrollTo({ top: navTarget(hash), behavior: "instant" });
    onScroll();
    void root.offsetHeight;  // apply the settled state before animations come back
    root.classList.remove("is-jumping");
    history.replaceState(null, "", hash);
    root.classList.remove("is-faded");
  })
);

// Scroll stops (laptops/tablets): hero → about → skills → start of the projects. One
// scroll gesture moves exactly one stop, up or down, with a short glide, so a hard swipe
// can't skip a section. A "gesture" is a burst of wheel events (trackpad momentum
// included) with no gap over 200 ms. Inside the projects, scrolling is free as before;
// scrolling up past their start stops there first. Phones scroll normally.
const STOP_GAP_MS = 200;
let stepping = false;
let lastWheelAt = 0;
let stepAnim = 0;

function scrollStops() {
  const at = (el) => el.getBoundingClientRect().top + window.scrollY;
  return [0, at(document.getElementById("about")), at(document.getElementById("skills")), projects.offsetTop];
}
const projectsStop = () => projects.offsetTop;

function glideTo(target) {
  cancelAnimationFrame(stepAnim);
  const from = window.scrollY, dist = target - from;
  if (reduceMotion.matches || Math.abs(dist) < 1) {
    window.scrollTo({ top: target, behavior: "instant" });
    stepping = false;
    return;
  }
  stepping = true;
  const t0 = performance.now(), dur = 650;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const frame = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    window.scrollTo({ top: from + dist * ease(t), behavior: "instant" });
    if (t < 1) stepAnim = requestAnimationFrame(frame);
    else stepping = false;
  };
  stepAnim = requestAnimationFrame(frame);
}

// next stop in a direction from y (or null when y is past the last one going down)
function stopFrom(y, dir) {
  const stops = scrollStops();
  return dir > 0 ? stops.find((s) => s > y + 4) ?? null : [...stops].reverse().find((s) => s < y - 4) ?? null;
}
const atAStop = (y) => scrollStops().some((s) => Math.abs(s - y) <= 4);
// true when a move of `delta` from y should be handled by the stops
function inStopZone(y, delta) {
  if (vertical) return false;
  const P = projectsStop();
  if (delta > 0) return y < P - 2;           // going down: anywhere above the projects
  return y <= P + 2 || y + delta < P - 2;    // going up: from the projects' start, or crossing it
}
function stepScroll(dir) {
  const y = window.scrollY, P = projectsStop();
  // a fast upward fling from inside the projects stops at their start first
  const target = dir < 0 && y > P + 2 ? P : stopFrom(y, dir);
  if (target !== null) glideTo(target);
}

window.addEventListener("wheel", (e) => {
  if (e.ctrlKey || vertical) return;
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
  const dy = e.deltaY * unit;
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey || !dy) return;   // sideways: see below
  const now = performance.now();
  const newGesture = now - lastWheelAt > STOP_GAP_MS;
  lastWheelAt = now;
  if (stepping) { e.preventDefault(); return; }
  if (!inStopZone(window.scrollY, dy)) return;
  e.preventDefault();
  if (atAStop(window.scrollY) && !newGesture) return;   // rest of a swipe that already moved
  stepScroll(Math.sign(dy));
}, { passive: false });

window.addEventListener("keydown", (e) => {
  if (vertical || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
  if (e.key === " " && e.target.closest && e.target.closest("button, a, [role=button]")) return;  // Space activates it
  const dir = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key] ?? (e.key === " " ? (e.shiftKey ? -1 : 1) : 0);
  if (!dir) return;
  if (stepping) { e.preventDefault(); return; }
  const y = window.scrollY;
  if (!inStopZone(y, dir * window.innerHeight * 0.5)) return;
  e.preventDefault();
  stepScroll(dir);
});

// touch: in the stop zone a vertical swipe moves one stop instead of scrolling freely
let swipe = null;
document.addEventListener("touchstart", (e) => {
  swipe = !vertical && e.touches.length === 1 ? { y0: e.touches[0].clientY, x0: e.touches[0].clientX, used: false } : null;
}, { passive: true });
document.addEventListener("touchmove", (e) => {
  if (!swipe) return;
  const t = e.touches[0], dy = swipe.y0 - t.clientY, dx = swipe.x0 - t.clientX;
  if (Math.abs(dx) > Math.abs(dy)) return;                  // sideways drags are handled elsewhere
  if (stepping) { e.preventDefault(); return; }
  if (!inStopZone(window.scrollY, dy || 1)) return;
  e.preventDefault();
  if (!swipe.used && Math.abs(dy) > 40) { swipe.used = true; stepScroll(Math.sign(dy)); }
}, { passive: false });
document.addEventListener("touchend", () => { swipe = null; });

// Sideways input while the projects track is pinned: trackpad side-swipes, Shift+wheel
// and horizontal finger drags are turned into the vertical scroll that drives the track,
// so the cards (and the contact card at the end) follow whichever way you scroll.
// Outside the pinned stretch, and on phones (plain vertical list), nothing changes.
const trackPinned = () => {
  if (vertical) return false;
  const r = projects.getBoundingClientRect();
  return r.top <= 1 && r.bottom >= window.innerHeight - 1;
};
const scrollPageBy = (dy) => window.scrollBy({ top: dy, behavior: "instant" });

window.addEventListener("wheel", (e) => {
  if (e.ctrlKey) return;                                  // pinch-zoom on trackpads
  let dx = e.deltaX, dy = e.deltaY;
  if (e.shiftKey && !dx) { dx = dy; dy = 0; }             // Shift+wheel scrolls sideways
  if (Math.abs(dx) <= Math.abs(dy) || !trackPinned()) return;
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
  e.preventDefault();                                     // also stops swipe-to-go-back here
  scrollPageBy(dx * unit);
}, { passive: false });

// Touch: the pin only lets the browser pan vertically (CSS touch-action: pan-y), so a
// sideways drag lands here; it scrolls the page by the drag and coasts a little on release.
let drag = null;
let coast = 0;
pin.addEventListener("touchstart", (e) => {
  cancelAnimationFrame(coast);
  const t = e.touches[0];
  drag = !vertical && e.touches.length === 1
    ? { x0: t.clientX, y0: t.clientY, x: t.clientX, time: performance.now(), v: 0, axis: null }
    : null;
}, { passive: true });
pin.addEventListener("touchmove", (e) => {
  if (!drag) return;
  const t = e.touches[0];
  if (!drag.axis) {
    const dx = t.clientX - drag.x0, dy = t.clientY - drag.y0;
    if (Math.hypot(dx, dy) < 8) return;                   // wait to see which way it's going
    drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  }
  if (drag.axis !== "x" || !trackPinned()) return;
  e.preventDefault();
  const now = performance.now(), step = t.clientX - drag.x;
  scrollPageBy(-step);                                    // drag left → move on through the cards
  drag.v = -step / Math.max(1, now - drag.time);          // px per ms, for the coast
  drag.x = t.clientX;
  drag.time = now;
}, { passive: false });
pin.addEventListener("touchend", () => {
  if (drag && drag.axis === "x" && !reduceMotion.matches) {
    let v = drag.v, last = performance.now();
    const step = (now) => {
      const dt = now - last; last = now;
      scrollPageBy(v * dt);
      v *= Math.pow(0.95, dt / 16);                        // ease to a stop
      if (Math.abs(v) > 0.02 && trackPinned()) coast = requestAnimationFrame(step);
    };
    coast = requestAnimationFrame(step);
  }
  drag = null;
});

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => { layout(); onScroll(); });
layout();
onScroll();
document.fonts.ready.then(layout);  // panel heights change once the web fonts load

document.getElementById("year").textContent = new Date().getFullYear();
