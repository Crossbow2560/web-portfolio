const intro = document.querySelector(".intro");
const stage = document.getElementById("stage");
const projects = document.getElementById("projects");
const pin = projects.querySelector(".projects-pin");
const track = document.getElementById("track");

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Horizontal-scroll geometry, recomputed on resize.
let travel = 0;     // px the track moves sideways
let holdStart = 0;  // px of vertical scroll before the track starts moving
let vertical = false; // phones: plain vertical list instead of the horizontal track

function layout() {
  const vw = pin.clientWidth;          // excludes the scrollbar
  const bp = window.innerWidth;        // matches CSS media queries
  const vh = window.innerHeight;

  fitPhoneAvatar();

  vertical = bp <= 760;  // matches the phone media query in style.css
  projects.classList.toggle("is-vertical", vertical);
  if (vertical) {
    travel = 0;
    projects.style.height = "";
    track.style.removeProperty("--track-x");
    return;
  }

  const pad = clamp(bp * 0.04, 16, 48);
  const content = Math.min(vw, 1600) - 2 * pad;
  const gap = bp <= 760 ? 16 : 28;
  const perView = bp >= 1100 ? 3 : bp > 760 ? 2 : 1.15;
  const cardW = (content - (perView - 1) * gap) / perView;
  const cards = track.querySelectorAll(".card:not(.contact-card)").length;

  track.style.setProperty("--card-gap", `${gap}px`);
  track.style.setProperty("--card-w", `${cardW}px`);
  track.style.setProperty("--contact-w", `${content}px`); // three card spaces on desktop
  pin.style.setProperty("--window-w", `${content}px`);

  // Sideways distance until the contact card fills the window exactly.
  travel = cards * (cardW + gap);
  holdStart = vh * 0.15;
  const holdEnd = vh * 0.25;
  projects.style.height = `${vh + holdStart + travel + holdEnd}px`;
}

// Phones: in the about and skills states the portrait stays at the bottom, scaled
// to fill the space left under that panel (it may grow past its hero size, but
// never wider than 70% of the screen).
function fitPhoneAvatar() {
  const phone = window.innerWidth <= 760;
  const img = stage.querySelector(".avatar img");
  for (const name of ["about", "skills"]) {
    if (!phone) { stage.style.removeProperty(`--av-scale-${name}`); continue; }
    const panel = stage.querySelector(`.${name}`);
    const free = window.innerHeight - (panel.offsetTop + panel.offsetHeight) - 16;
    // centred in both states, up to 70% of the screen width
    const maxScale = Math.min(2, (window.innerWidth * 0.7) / img.offsetWidth);
    stage.style.setProperty(`--av-scale-${name}`, clamp(free / img.offsetHeight, 0.25, maxScale).toFixed(3));
  }
}
// Re-fit whenever anything that affects it changes size: the viewport (rotation,
// browser bars, device previews), the panels (web fonts loading) or the image.
new ResizeObserver(fitPhoneAvatar).observe(document.documentElement);
for (const el of stage.querySelectorAll(".about, .skills, .avatar img"))
  new ResizeObserver(fitPhoneAvatar).observe(el);

function onScroll() {
  const vh = window.innerHeight;

  // Frames 1 → 2 → 3: hero, about, skills, then fade the stage out completely.
  // The fade ends at the same distance from the intro's end as before, so the
  // projects crossfade timing is unchanged.
  const scrollable = intro.offsetHeight - vh;
  const p = clamp(-intro.getBoundingClientRect().top / scrollable, 0, 1);
  stage.classList.toggle("is-about", p > 0.18);
  stage.classList.toggle("is-skills", p > 0.5);
  const shrink = clamp((p - 0.832) / 0.12, 0, 1);
  stage.style.setProperty("--shrink", shrink.toFixed(3));
  stage.style.visibility = shrink >= 1 ? "hidden" : "";

  // Phones: each card rises in as it scrolls into view (not before the skills
  // panel is halfway faded, so cards never sit on top of it).
  if (vertical) {
    if (shrink < 0.5) return;
    for (const card of track.children)
      if (card.getBoundingClientRect().top < vh * 0.92) card.classList.add("in");
    return;
  }

  // Frame 3: cards rise in, then vertical scroll drives them sideways.
  const top = projects.getBoundingClientRect().top;
  if (top < vh * 0.6) projects.classList.add("in");
  let x = clamp(-top - holdStart, 0, travel);
  if (travel - x < 1) x = travel;  // fractional scroll positions can stop a hair short
  track.style.setProperty("--track-x", x.toFixed(1));
}

// Contact lives at the end of the horizontal track, so jump to the end of the section.
document.querySelectorAll('a[href="#contact"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const top = vertical
      ? document.getElementById("contact").getBoundingClientRect().top + window.scrollY - 96
      : projects.offsetTop + projects.offsetHeight - window.innerHeight;
    window.scrollTo({ top });
  })
);

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => { layout(); onScroll(); });
layout();
onScroll();
document.fonts.ready.then(layout);  // panel heights change once the web fonts load

document.getElementById("year").textContent = new Date().getFullYear();
