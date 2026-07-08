/* ==========================================================================
   components.js — Injects the shared shell (header / footer / modals),
   initializes icons, marks the active nav item, wires the mobile sidebar
   and header scroll state, then announces `app:ready`.

   Every other module waits for `app:ready` — never for DOMContentLoaded.
   ========================================================================== */

window.App = window.App || {};

(function () {
  "use strict";

  const SLOTS = [
    { id: "site-header", file: "components/header.html" },
    { id: "site-footer", file: "components/footer.html" },
    { id: "site-modals", file: "components/modals.html" },
  ];

  /* ------------------------------------------------------------------
     Inject one component. Fails soft: a missing file logs a warning
     instead of killing the whole page.
     ------------------------------------------------------------------ */
  async function inject({ id, file }) {
    const slot = document.getElementById(id);
    if (!slot) return;

    try {
      const res = await fetch(file, { credentials: "same-origin", cache: "no-cache" });
      if (!res.ok) throw new Error(`${file} → HTTP ${res.status}`);
      slot.innerHTML = await res.text(); // trusted, same-origin static file
    } catch (err) {
      console.warn("[components] failed to load", file, err);
    }
  }

  /* ------------------------------------------------------------------
     Highlight the current page in desktop nav + mobile sidebar.
     data-nav="index|projects|about" ⇄ current filename.
     ------------------------------------------------------------------ */
  function markActiveNav() {
    const page =
      (location.pathname.split("/").pop() || "index.html")
        .replace(".html", "") || "index";

    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === page) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ------------------------------------------------------------------
     Mobile sidebar — one delegated listener, body class drives CSS.
     ------------------------------------------------------------------ */
  function initSidebar() {
    const menuBtn = document.getElementById("mobileMenuBtn");
    if (!menuBtn) return;

    const setOpen = (open) => {
      document.body.classList.toggle("sidebar-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      if (open) {
        const firstLink = document.querySelector(".mobile-sidebar a, .mobile-sidebar button");
        firstLink && firstLink.focus();
      } else {
        menuBtn.focus();
      }
    };

    menuBtn.addEventListener("click", () => setOpen(true));

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-close-sidebar]")) setOpen(false);
      // Navigating away from the sidebar should also close it
      if (e.target.closest(".mobile-sidebar a")) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("sidebar-open")) {
        setOpen(false);
      }
    });

    App.closeSidebar = () => setOpen(false);
  }

  /* ------------------------------------------------------------------
     Header shadow once the page is scrolled.
     ------------------------------------------------------------------ */
  function initHeaderState() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const onScroll = () =>
      header.classList.toggle("is-scrolled", window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  async function boot() {
    await Promise.all(SLOTS.map(inject));

    if (window.lucide) lucide.createIcons();

    markActiveNav();
    initSidebar();
    initHeaderState();

    // Single signal the rest of the app listens for.
    document.dispatchEvent(new CustomEvent("app:ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();