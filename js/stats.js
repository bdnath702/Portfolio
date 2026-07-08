/* ==========================================================================
   stats.js — Animated counters + live GitHub numbers.

   • Any element with data-count="N" counts from 0 → N the first time it
     scrolls into view (eased, ~1.1s, tabular numerals — no layout shift).
   • Any element with data-github="repos|followers" gets its target
     replaced by the live number from GitHub's public API before the
     count-up runs.
   • GitHub response is cached in sessionStorage for 1 hour — the
     unauthenticated API allows 60 requests/hour per IP, and one visitor
     clicking through your pages shouldn't burn them.
   • API failure = the hardcoded fallback in the HTML is used. The page
     never shows an error for a cosmetic feature.
   ========================================================================== */

(function () {
  "use strict";

  const GITHUB_USER = "bdnath702";
  const CACHE_KEY = "gh-stats";
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour
  const DURATION = 1100;            // ms per count-up

  const FIELD_MAP = {
    repos: "public_repos",
    followers: "followers",
  };

  /* ---------------- GitHub fetch with cache ---------------- */
  async function githubStats() {
    // 1) Try cache
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (Date.now() - cached.at < CACHE_TTL) return cached.data;
      }
    } catch (_) { /* ignore */ }

    // 2) Fetch fresh
    try {
      const res = await fetch(
        "https://api.github.com/users/" + encodeURIComponent(GITHUB_USER),
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) throw new Error("HTTP " + res.status);

      const json = await res.json();
      const data = {
        public_repos: Number(json.public_repos) || 0,
        followers: Number(json.followers) || 0,
      };

      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ at: Date.now(), data })
        );
      } catch (_) { /* storage full/blocked — fine */ }

      return data;
    } catch (err) {
      console.warn("[stats] GitHub fetch failed — using fallbacks", err);
      return null;
    }
  }

  /* ---------------- Count-up ---------------- */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function countUp(el, target) {
    if (target <= 0) {
      el.textContent = String(target);
      return;
    }

    el.classList.add("is-counting");
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / DURATION, 1);
      el.textContent = String(Math.round(easeOutCubic(p) * target));
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.classList.remove("is-counting");
      }
    }

    requestAnimationFrame(tick);
  }

  /* ---------------- Boot ---------------- */
  async function init() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    // Patch live GitHub numbers into their targets first.
    const ghTargets = document.querySelectorAll("[data-github]");
    if (ghTargets.length) {
      const stats = await githubStats();
      if (stats) {
        ghTargets.forEach((el) => {
          const field = FIELD_MAP[el.dataset.github];
          if (field && stats[field] > 0) {
            el.dataset.count = String(stats[field]);
            el.textContent = "0";
          }
        });
      }
    }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      counters.forEach((el) => {
        el.textContent = el.dataset.count;
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          countUp(entry.target, parseInt(entry.target.dataset.count, 10) || 0);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((el) => io.observe(el));
  }

  document.addEventListener("app:ready", init);
})();