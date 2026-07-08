/* ==========================================================================
   cursor.js — Custom two-part cursor (dot + trailing ring).

   • Desktop only: requires (hover: hover) and (pointer: fine). Touch
     devices never load any of this. Reduced motion disables it too.
   • The ring eases toward the pointer and is gently attracted to the
     center of interactive elements — "magnetic" without ever moving the
     elements themselves (so it can't fight CSS hover transforms).
   • Native cursor is hidden EXCEPT over text fields, where a custom
     cursor hurts more than it delights.
   • Styles are injected by this module — it's a self-contained drop-in.
   ========================================================================== */

(function () {
  "use strict";

  const INTERACTIVE =
    'a, button, [data-open-modal], [data-open-terminal], .tech-pill, ' +
    'label, summary';
  const TEXT_FIELDS = 'input, textarea, select, [contenteditable="true"]';

  function injectStyles() {
    const css = `
      body.has-cursor, body.has-cursor a, body.has-cursor button {
        cursor: none;
      }
      body.has-cursor input,
      body.has-cursor textarea,
      body.has-cursor select {
        cursor: auto;
      }
      .cursor-dot, .cursor-ring {
        position: fixed;
        top: 0; left: 0;
        z-index: var(--z-cursor);
        pointer-events: none;
        border-radius: 50%;
        will-change: transform;
      }
      .cursor-dot {
        width: 6px; height: 6px;
        background: var(--accent);
      }
      .cursor-ring {
        width: 34px; height: 34px;
        border: 1.5px solid var(--text-3);
        transition: width 200ms var(--ease-out),
                    height 200ms var(--ease-out),
                    border-color 200ms var(--ease-out),
                    opacity 200ms var(--ease-out);
      }
      .cursor-ring.is-hover {
        width: 52px; height: 52px;
        border-color: var(--accent);
      }
      .cursor-dot.is-hidden, .cursor-ring.is-hidden {
        opacity: 0;
      }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function init() {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    injectStyles();
    document.body.classList.add("has-cursor");

    const dot = document.createElement("div");
    dot.className = "cursor-dot is-hidden";
    const ring = document.createElement("div");
    ring.className = "cursor-ring is-hidden";
    document.body.append(dot, ring);

    let mx = -100, my = -100;   // real pointer
    let rx = -100, ry = -100;   // eased ring position
    let magnet = null;          // center of hovered interactive element

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.classList.remove("is-hidden");
      ring.classList.remove("is-hidden");

      const el = e.target.closest(INTERACTIVE);
      const isText = e.target.closest(TEXT_FIELDS);

      if (isText) {
        // Over text fields: hide custom cursor, native takes over.
        dot.classList.add("is-hidden");
        ring.classList.add("is-hidden");
        magnet = null;
        ring.classList.remove("is-hover");
      } else if (el) {
        const r = el.getBoundingClientRect();
        magnet = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        ring.classList.add("is-hover");
      } else {
        magnet = null;
        ring.classList.remove("is-hover");
      }
    }, { passive: true });

    document.addEventListener("pointerleave", () => {
      dot.classList.add("is-hidden");
      ring.classList.add("is-hidden");
    });

    (function loop() {
      // Ring target: pointer, pulled 25% toward the magnet center.
      const tx = magnet ? mx + (magnet.x - mx) * 0.25 : mx;
      const ty = magnet ? my + (magnet.y - my) * 0.25 : my;

      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;

      dot.style.transform =
        `translate(${mx - 3}px, ${my - 3}px)`;
      ring.style.transform =
        `translate(${rx - ring.offsetWidth / 2}px, ${ry - ring.offsetHeight / 2}px)`;

      requestAnimationFrame(loop);
    })();
  }

  document.addEventListener("app:ready", init);
})();