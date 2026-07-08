/* ==========================================================================
   modals.js — All dialogs + AJAX forms + toast.

   • Declarative: any element with data-open-modal="id" opens that modal;
     data-close-modal closes; clicking the backdrop closes; Esc closes.
   • Accessible: focus is trapped inside the open dialog and returned to
     the trigger on close.
   • Forms with [data-ajax-form] submit to Formspree via fetch — the user
     never leaves the page (your old forms did a full redirect).
   • Resume iframe: data-src → src on first open only (Core Web Vitals).
   ========================================================================== */

window.App = window.App || {};

(function () {
  "use strict";

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), ' +
    'textarea:not([disabled]), select:not([disabled]), [tabindex="0"]';

  let openModal = null;
  let lastTrigger = null;

  /* ------------------------------------------------------------------
     Toast — shared, promise-safe (rapid calls don't stack timers).
     ------------------------------------------------------------------ */
  let toastTimer = null;

  App.toast = function (message) {
    const toast = document.getElementById("toast");
    const msg = document.getElementById("toastMsg");
    if (!toast || !msg) return;

    msg.textContent = message; // textContent — never innerHTML
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  };

  /* ------------------------------------------------------------------
     Open / close
     ------------------------------------------------------------------ */
  function open(id, trigger) {
    const modal = document.getElementById(id);
    if (!modal || modal === openModal) return;

    if (openModal) close(); // only one dialog at a time

    lastTrigger = trigger || document.activeElement;
    openModal = modal;

    // Lazy-load iframes (resume PDF) on first open only.
    modal.querySelectorAll("iframe[data-src]").forEach((frame) => {
      frame.src = frame.dataset.src;
      frame.removeAttribute("data-src");
    });

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("open"));
    document.body.style.overflow = "hidden";

    const first = modal.querySelector(FOCUSABLE);
    first && first.focus();
  }

  function close() {
    if (!openModal) return;
    const modal = openModal;
    openModal = null;

    modal.classList.remove("open");
    document.body.style.overflow = "";

    // Hide after the CSS transition so the exit animation plays.
    setTimeout(() => {
      modal.hidden = true;
    }, 350);

    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  App.openModal = open;
  App.closeModal = close;

  /* ------------------------------------------------------------------
     Focus trap
     ------------------------------------------------------------------ */
  function trapFocus(e) {
    if (!openModal || e.key !== "Tab") return;

    const items = Array.from(openModal.querySelectorAll(FOCUSABLE))
      .filter((el) => el.offsetParent !== null);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ------------------------------------------------------------------
     AJAX form submission (Formspree)
     ------------------------------------------------------------------ */
  function bindForms() {
    document.querySelectorAll("[data-ajax-form]").forEach((form) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Honeypot: bots fill it, humans never see it. Pretend success.
        const trap = form.querySelector('input[name="_gotcha"]');
        if (trap && trap.value) {
          form.reset();
          close();
          return;
        }

        const button = form.querySelector('button[type="submit"]');
        const label = form.querySelector("[data-submit-label]");
        const original = label ? label.textContent : "";

        if (button) button.disabled = true;
        if (label) label.textContent = "Sending…";

        try {
          const res = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" },
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          form.reset();
          close();
          App.toast("Message sent — I'll reply soon.");
        } catch (err) {
          console.warn("[form] submit failed", err);
          App.toast("Couldn't send right now. Please try again.");
        } finally {
          if (button) button.disabled = false;
          if (label) label.textContent = original;
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Global wiring — one delegated listener for the whole site.
     ------------------------------------------------------------------ */
  function init() {
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open-modal]");
      if (opener) {
        e.preventDefault();
        if (App.closeSidebar) App.closeSidebar(); // opening from mobile menu
        open(opener.dataset.openModal, opener);
        return;
      }

      if (e.target.closest("[data-close-modal]")) {
        close();
        return;
      }

      // Backdrop click: the .modal element itself, not its children.
      if (openModal && e.target === openModal) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      trapFocus(e);
    });

    bindForms();
  }

  document.addEventListener("app:ready", init);
})();