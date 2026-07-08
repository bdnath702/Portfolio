/* ==========================================================================
   welcome.js — Multilingual welcome overlay.

   • Cycles greetings, then curtain-wipes away (CSS handles the motion).
   • Runs ONCE PER SESSION (sessionStorage) — repeat visits inside the
     same tab go straight to content. Repetition is where charm dies.
   • Reduced-motion users and return visits skip it entirely.
   • When finished it adds .hero-ready to <body>, which starts the hero
     entrance animation — so the two sequences never overlap.
   ========================================================================== */

(function () {
  "use strict";

  const KEY = "welcomed";
  const GREETINGS = [
    "Welcome",
    "স্বাগতম",     // Bengali
    "स्वागत है",    // Hindi
    "ようこそ",     // Japanese
    "Bienvenue",   // French
    "Willkommen",  // German
    "Hola",        // Spanish
  ];
  const WORD_MS = 210;   // time per greeting
  const EXIT_MS = 660;   // must be ≥ the CSS wipe duration

  function alreadyWelcomed() {
    try {
      return sessionStorage.getItem(KEY) === "1";
    } catch (_) {
      return false; // storage blocked → show once, harmless
    }
  }

  function markWelcomed() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (_) { /* ignore */ }
  }

  function finish(overlay) {
    document.body.classList.add("hero-ready");
    if (overlay) overlay.remove();
  }

  function init() {
    const overlay = document.getElementById("welcomeOverlay");
    const word = document.getElementById("welcomeWord");

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // No overlay on this page, already seen, or reduced motion → skip.
    if (!overlay || !word || alreadyWelcomed() || reduced) {
      finish(overlay);
      return;
    }

    markWelcomed();

    let i = 0;
    word.textContent = GREETINGS[0];

    const cycle = setInterval(() => {
      i += 1;

      if (i >= GREETINGS.length) {
        clearInterval(cycle);
        overlay.classList.add("is-leaving");
        setTimeout(() => finish(overlay), EXIT_MS);
        return;
      }

      word.textContent = GREETINGS[i];
    }, WORD_MS);

    // Escape hatch: click/keypress skips the intro. Respect impatience.
    overlay.addEventListener("click", skip, { once: true });
    document.addEventListener("keydown", skip, { once: true });

    function skip() {
      clearInterval(cycle);
      overlay.classList.add("is-leaving");
      setTimeout(() => finish(overlay), EXIT_MS);
    }
  }

  document.addEventListener("app:ready", init);
})();