// Fraction of the screen height used for both the top dead zone and the bottom override.
const EDGE_FRACTION = 0.15;

const bar = document.getElementById("navbar");
const separator = document.getElementById("nav-sep");
const sectionLabel = document.getElementById("nav-section");
const sections = [...document.querySelectorAll("main > section")];
const menu = document.getElementById("nav-menu");
const toggle = document.getElementById("nav-toggle");
const tabs = [...menu.querySelectorAll("a")];
const canHover = window.matchMedia("(hover: hover)");
const isWideLayout = window.matchMedia("(min-width: 768px)");

let centerId = sections[0].id;

function setFocused(focused) {
  bar.dataset.focused = String(focused);
}

function isMenuOpen() {
  return bar.dataset.menuOpen === "true";
}

// An open menu keeps the bar focused so it doesn't fade while in use.
function setMenuOpen(open) {
  bar.dataset.menuOpen = String(open);
  toggle.setAttribute("aria-expanded", String(open));
  if (open) setFocused(true);
}

// What the user can see right now: hovering counts only on devices that can hover.
function looksFocused() {
  if (bar.dataset.focused === "true") return true;
  return canHover.matches && (bar.matches(":hover") || bar.matches(":focus-within"));
}

function isPastTop() {
  return window.scrollY > window.innerHeight * EDGE_FRACTION;
}

function isNearBottom() {
  const bottomEdge = window.scrollY + window.innerHeight;
  return bottomEdge >= document.documentElement.scrollHeight - window.innerHeight * EDGE_FRACTION;
}

function renderSection() {
  const id = isNearBottom() ? sections[sections.length - 1].id : centerId;
  const section = document.getElementById(id);
  const isHome = id === sections[0].id;

  separator.hidden = isHome;
  sectionLabel.textContent = isHome ? "" : section.dataset.label;
  tabs.forEach((tab) => {
    if (tab.getAttribute("href") === `#${id}`) {
      tab.setAttribute("aria-current", "true");
    } else {
      tab.removeAttribute("aria-current");
    }
  });
}

// A 1px band across the middle of the screen: a section "wins" while it overlaps that line.
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) centerId = entry.target.id;
    });
    renderSection();
  },
  { rootMargin: "-50% 0px -50% 0px" }
);
sections.forEach((section) => observer.observe(section));

window.addEventListener(
  "scroll",
  () => {
    setMenuOpen(false);
    setFocused(!isPastTop());
    renderSection();
  },
  { passive: true }
);

// Tapping anywhere off the bar closes the menu and unfocuses the bar (only past the top zone).
document.addEventListener("pointerdown", (event) => {
  if (bar.contains(event.target)) return;
  setMenuOpen(false);
  if (isPastTop()) setFocused(false);
});

// A click on an unfocused bar only refocuses it; the next one navigates or opens the menu.
// stopPropagation keeps the menu button's own click handler from firing on that first tap.
bar.addEventListener(
  "click",
  (event) => {
    if (!looksFocused()) {
      event.preventDefault();
      event.stopPropagation();
      setFocused(true);
    }
  },
  true
);

toggle.addEventListener("click", () => setMenuOpen(!isMenuOpen()));

menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isMenuOpen()) {
    setMenuOpen(false);
    toggle.focus();
  }
});

// The menu doesn't exist in the wide layout, so don't leave it marked open.
isWideLayout.addEventListener("change", () => setMenuOpen(false));

bar.addEventListener("focusin", () => setFocused(true));

setFocused(!isPastTop());
renderSection();
