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
  const cards = track.querySelectorAll(".card:not(.contact-card)").length;

  track.style.setProperty("--card-gap", `${gap}px`);
  track.style.setProperty("--card-w", `${cardW}px`);
  track.style.setProperty("--contact-w", `${content}px`); // three card spaces on desktop
  pin.style.setProperty("--window-w", `${content}px`);

  // Sideways distance until the contact card fills the window exactly.
  travel = cards * (cardW + gap);
  lastStep = cardW + gap;
  holdStart = vh * 0.15;
  const holdEnd = vh * 0.25;
  projects.style.height = `${vh + holdStart + travel + holdEnd}px`;
}

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
  // Timeline in vh scrolled through the intro (380vh tall, 280vh scrollable):
  //   0–36 hero · 36–140 about · 140–246.4 skills · 246.4–270.4 fade · 270.4–280 tail
  // The fade ends 9.6vh before the intro does, which the projects crossfade relies on.
  const sv = (-intro.getBoundingClientRect().top / vh) * 100;
  stage.classList.toggle("is-about", sv > 36);
  stage.classList.toggle("is-skills", sv > 140);
  const shrink = clamp((sv - 246.4) / 24, 0, 1);
  stage.style.setProperty("--shrink", shrink.toFixed(3));
  stage.style.visibility = shrink >= 1 ? "hidden" : "";

  // Frame 3: cards rise in, then vertical scroll drives them sideways.
  const top = projects.getBoundingClientRect().top;
  projects.classList.toggle("in", top < vh * 0.6);  // undone when scrolling back up
  let x = clamp(-top - holdStart, 0, travel);
  if (travel - x < 1) x = travel;  // fractional scroll positions can stop a hair short
  track.style.setProperty("--track-x", x.toFixed(1));
  // the header fades out during the last slide, as the contact card comes in
  pin.style.setProperty("--contact-in", clamp((x - (travel - lastStep)) / lastStep, 0, 1).toFixed(3));
  // dead end: the contact card has fully slid in
  pin.classList.toggle("contact-done", travel > 0 && x >= travel - 1);
}

// Contact lives at the end of the horizontal track, so jump to the end of the section.
document.querySelectorAll('a[href="#contact"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const top = vertical
      ? document.getElementById("contact").getBoundingClientRect().top + window.scrollY - 140
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
