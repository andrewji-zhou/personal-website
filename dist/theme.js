const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function savedTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const SWITCH_MS = 300;
let switchTimer;

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
}

// Turns on the color transitions just for this change, then removes them again.
function switchTheme(theme) {
  if (!reducedMotion.matches) {
    root.classList.add("theme-switching");
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => root.classList.remove("theme-switching"), SWITCH_MS);
  }
  applyTheme(theme);
}

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  switchTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Private windows can block storage; the choice just won't be remembered.
  }
});

// Until the visitor picks a theme themselves, follow the system setting as it changes.
prefersDark.addEventListener("change", (event) => {
  if (!savedTheme()) switchTheme(event.matches ? "dark" : "light");
});

// The head script already set data-theme; this only syncs the button's state.
applyTheme(root.dataset.theme);
