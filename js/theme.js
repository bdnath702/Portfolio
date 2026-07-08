/* ==========================================================================
   theme.js — Dark / light theme.

   IMPORTANT: the no-flash boot snippet stays INLINE in <head> of every
   page (you'll get it in the index.html step). This module only handles
   the toggle, persistence, system-preference fallback, and broadcasting
   changes so the Three.js scene can recolor live.
   ========================================================================== */

window.App = window.App || {};

(function () {
  "use strict";

  const KEY = "theme";
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function systemPrefersDark() {
    return media.matches;
  }

  function isDark() {
    return root.classList.contains("dark-theme");
  }

  /* Keep the browser UI (mobile address bar) matched to the page bg */
  function syncMetaThemeColor() {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = getComputedStyle(document.body)
      .getPropertyValue("background-color");
  }

  function apply(dark, persist) {
    root.classList.toggle("dark-theme", dark);
    if (persist) {
      try {
        localStorage.setItem(KEY, dark ? "dark" : "light");
      } catch (_) {
        /* storage unavailable (private mode) — theme still works per-visit */
      }
    }
    syncMetaThemeColor();

    // hero3d.js and any future consumer re-reads CSS tokens on this event.
    document.dispatchEvent(
      new CustomEvent("app:themechange", { detail: { dark } })
    );
  }

  function init() {
    // The inline head snippet already applied the saved theme pre-paint.
    // If nothing was saved, fall back to the OS preference now.
    let saved = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch (_) { /* ignore */ }

    if (saved === null && systemPrefersDark()) {
      apply(true, false);
    } else {
      syncMetaThemeColor();
    }

    // Follow OS changes only while the user hasn't chosen manually.
    media.addEventListener("change", (e) => {
      let stored = null;
      try {
        stored = localStorage.getItem(KEY);
      } catch (_) { /* ignore */ }
      if (stored === null) apply(e.matches, false);
    });

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => apply(!isDark(), true));
    }
  }

  document.addEventListener("app:ready", init);
})();