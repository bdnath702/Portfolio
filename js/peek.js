/* ==========================================================================
   peek.js — "Your browser just told me…"

   THE RULE THAT MAKES THIS FEATURE WORK: zero network activity.
   No fetch(), no beacons, no storage of any kind. Every value is read
   from local browser APIs and written straight to the DOM. The footer
   claim ("Stored: nothing. Sent: nowhere.") must survive a DevTools
   Network-tab inspection — and with this file, it does.

   Values a browser refuses to expose are shown in green as a win:
   on a privacy site, "hidden" is a feature, not an error.
   ========================================================================== */

(function () {
  "use strict";

  const HIDDEN = "not exposed by your browser ✓";

  function set(field, value, good) {
    const el = document.querySelector('[data-peek="' + field + '"]');
    if (!el) return;
    el.textContent = value;                 // textContent only, always
    el.classList.toggle("peek-good", !!good);
  }

  /* ---------------- Detectors (all local, all guarded) ---------------- */

  function detectDevice() {
    const ua = navigator.userAgent || "";

    let os = "Unknown OS";
    if (/Windows NT 10/.test(ua))      os = "Windows 10/11";
    else if (/Windows/.test(ua))       os = "Windows";
    else if (/Android/.test(ua))       os = "Android";
    else if (/iPhone|iPad/.test(ua))   os = "iOS";
    else if (/Mac OS X/.test(ua))      os = "macOS";
    else if (/Linux/.test(ua))         os = "Linux";

    let browser = "browser";
    let m;
    if ((m = ua.match(/Edg\/(\d+)/)))          browser = "Edge " + m[1];
    else if ((m = ua.match(/OPR\/(\d+)/)))     browser = "Opera " + m[1];
    else if ((m = ua.match(/Firefox\/(\d+)/))) browser = "Firefox " + m[1];
    else if ((m = ua.match(/Chrome\/(\d+)/)))  browser = "Chrome " + m[1];
    else if ((m = ua.match(/Version\/(\d+).+Safari/))) browser = "Safari " + m[1];

    return os + " · " + browser;
  }

  function detectScreen() {
    try {
      return screen.width + " × " + screen.height +
             " · " + screen.colorDepth + "-bit";
    } catch (_) {
      return null;
    }
  }

  function detectTimezone() {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offsetMin = -new Date().getTimezoneOffset();
      const sign = offsetMin >= 0 ? "+" : "-";
      const abs = Math.abs(offsetMin);
      const hh = String(Math.floor(abs / 60));
      const mm = String(abs % 60).padStart(2, "0");
      return zone + " (UTC" + sign + hh + ":" + mm + ")";
    } catch (_) {
      return null;
    }
  }

  function detectLanguage() {
    const langs = navigator.languages;
    if (langs && langs.length) return langs.slice(0, 3).join(", ");
    return navigator.language || null;
  }

  function detectHardware() {
    const cores = navigator.hardwareConcurrency;
    const mem = navigator.deviceMemory; // Chromium only, capped at 8
    if (!cores && !mem) return null;

    const parts = [];
    if (cores) parts.push(cores + " cores");
    if (mem) parts.push(mem + " GB+ RAM");
    return parts.join(" · ");
  }

  function detectConnection() {
    const c = navigator.connection;
    if (!c || !c.effectiveType) return null;

    let out = c.effectiveType;
    if (c.downlink) out += " · ~" + Math.round(c.downlink) + " Mbps";
    return out;
  }

  function detectBattery() {
    // Async, Chromium-only. Resolves to a string or null.
    if (typeof navigator.getBattery !== "function") {
      return Promise.resolve(null);
    }
    return navigator.getBattery()
      .then(function (b) {
        return Math.round(b.level * 100) + "% · " +
               (b.charging ? "charging" : "not charging");
      })
      .catch(function () { return null; });
  }

  /* ---------------- Boot ---------------- */

  function fill() {
    set("device", detectDevice());

    const s = detectScreen();
    s ? set("screen", s) : set("screen", HIDDEN, true);

    const tz = detectTimezone();
    tz ? set("timezone", tz) : set("timezone", HIDDEN, true);

    const lang = detectLanguage();
    lang ? set("language", lang) : set("language", HIDDEN, true);

    const hw = detectHardware();
    hw ? set("hardware", hw) : set("hardware", HIDDEN, true);

    const conn = detectConnection();
    conn ? set("connection", conn) : set("connection", HIDDEN, true);

    detectBattery().then(function (b) {
      b ? set("battery", b) : set("battery", HIDDEN, true);
    });
  }

  function init() {
    const card = document.getElementById("peekCard");
    if (!card) return;

    fill();

    const status = document.getElementById("peekStatus");

    function done() {
      card.classList.add("is-scanned");
      if (status) {
        // Small delay so the badge flips as the last row prints.
        setTimeout(function () {
          status.textContent = "scan complete";
          status.classList.add("is-done");
        }, 950);
      }
    }

    if (!("IntersectionObserver" in window)) {
      done();
      return;
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.disconnect(); // scan once per page load
          done();
        });
      },
      { threshold: 0.4 }
    );

    io.observe(card);
  }

  document.addEventListener("app:ready", init);
})();