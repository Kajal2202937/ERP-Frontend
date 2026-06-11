const STORAGE_KEY = "theme";
const TRANSITION_MS = 250;

/** @type {Set<(theme: string) => void>} */
const listeners = new Set();

function readStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(theme) {
  queueMicrotask(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  });
}

function isValid(v) {
  return v === "dark" || v === "light";
}

function hasExplicitPref() {
  return isValid(readStorage());
}

function getPreferred() {
  const stored = readStorage();
  if (isValid(stored)) return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function write(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  writeStorage(theme);
  listeners.forEach((fn) => fn(theme));
}

let _busy = false;

export function getTheme() {
  const attr = document.documentElement.getAttribute("data-theme");
  return isValid(attr) ? attr : "dark";
}

export function toggle() {
  if (_busy) return;
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
}

export function setTheme(theme) {
  if (!isValid(theme) || _busy || getTheme() === theme) return;

  _busy = true;
  document.documentElement.setAttribute("data-theme-switching", "");
  write(theme);

  setTimeout(() => {
    document.documentElement.removeAttribute("data-theme-switching");
    _busy = false;
  }, TRANSITION_MS + 30);
}

/**
 * Subscribe to theme changes. Returns an unsubscribe function.
 * ThemeContext calls this in useEffect to keep React state in sync.
 *
 * @param {(theme: string) => void} fn
 * @returns {() => void} cleanup
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (!isValid(document.documentElement.getAttribute("data-theme"))) {
  write(getPreferred());
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (hasExplicitPref()) return;
    write(e.matches ? "dark" : "light");
  });
