/* ==========================================================================
   tilt.js — 3D perspective tilt for [data-tilt] cards.

   JS only measures the pointer and writes three custom properties
   (--rx, --ry, --tz); all actual transforms live in animations.css.
   Desktop-only by design: tilt on touch feels broken, so we require a
   fine pointer that can hover. Reduced motion disables it entirely.
   ========================================================================== */

(function () {
  "use strict";

  const MAX_TILT = 7;   // degrees — perceptible, not seasick
  const RAISE = 18;     // px translateZ for .tilt-raise children

  function init() {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const cards = document.querySelectorAll("[data-tilt]");
    if (!cards.length) return;

    cards.forEach((card) => {
      let frame = null;

      card.addEventListener("pointermove", (e) => {
        if (frame) return; // one write per frame
        frame = requestAnimationFrame(() => {
          frame = null;
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;  // 0 → 1
          const py = (e.clientY - rect.top) / rect.height;  // 0 → 1

          card.style.setProperty("--ry", ((px - 0.5) * 2 * MAX_TILT).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((0.5 - py) * 2 * MAX_TILT).toFixed(2) + "deg");
          card.style.setProperty("--tz", RAISE + "px");
        });
      });

      card.addEventListener("pointerleave", () => {
        if (frame) {
          cancelAnimationFrame(frame);
          frame = null;
        }
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--tz", "0px");
      });
    });
  }

  document.addEventListener("app:ready", init);
})();