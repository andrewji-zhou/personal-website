// How long the "Copied" / "Failed" message stays before the email comes back.
const RESET_MS = 2000;

const copyTarget = document.getElementById("email-copy");
const label = document.getElementById("email-label");
const status = document.getElementById("email-status");

let resetTimer;

function show(state, message) {
  copyTarget.dataset.state = state;
  label.textContent = message;
  status.textContent = message;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    copyTarget.dataset.state = "idle";
    label.textContent = "Copy?";
    status.textContent = "";
  }, RESET_MS);
}

async function copyEmail() {
  // Dragging to highlight the address ends in a click too; leave the selection alone.
  if (window.getSelection().toString() !== "") return;

  try {
    await navigator.clipboard.writeText(copyTarget.dataset.email);
    show("copied", "Copied to clipboard");
  } catch {
    // Also covers browsers without the Clipboard API, and insecure (plain http) pages.
    show("failed", "Failed to copy");
  }
}

copyTarget.addEventListener("click", copyEmail);

copyTarget.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    copyEmail();
  }
});
