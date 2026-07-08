/* ==========================================================================
   scroll.js — Scroll-linked behavior.

   1. Reveals: IntersectionObserver adds .in-view to [data-reveal] and
      [data-reveal-stagger] elements the first time they enter the
      viewport. One observer, unobserve after firing — zero ongoing cost.
   2. Progress bar: writes --progress (0→1) on the .scroll-progress
      element, rAF-throttled.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------- Reveals ---------------- */
  function initReveals() {
    const targets = document.querySelectorAll(
      "[data-reveal], [data-reveal-stagger]"
    );
    if (!targets.length) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      // Show everything immediately — CSS also covers this, belt & braces.
      targets.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          io.unobserve(entry.target); // fire once, then forget
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px", // trigger slightly before fully visible
      }
    );

    targets.forEach((el) => io.observe(el));
  }

  /* ---------------- Progress bar ---------------- */
  function initProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;

    let ticking = false;

    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.setProperty("--progress", p.toFixed(4));
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    update();
  }

  document.addEventListener("app:ready", () => {
    initReveals();
    initProgress();
  });
})();