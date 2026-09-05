/* ==========================================================================
   repos.js — Live star / fork counts for the Open Source cards.

   • One request for the whole account (…/users/NAME/repos), not one per
     card — the unauthenticated API allows 60 requests/hour per IP.
   • Cached in sessionStorage for 1 hour, same contract as stats.js.
   • Counts are authored as hidden in the HTML and only revealed when
     GitHub reports a number above zero, so a fresh repo shows its
     language alone instead of a row of zeros.
   • API failure = the cards render exactly as authored. A cosmetic
     feature never breaks the page.
   ========================================================================== */

(function () {
  "use strict";

  const GITHUB_USER = "bdnath702";
  const CACHE_KEY = "gh-repos";
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour

  async function fetchRepos() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (Date.now() - cached.at < CACHE_TTL) return cached.data;
      }
    } catch (_) { /* ignore */ }

    try {
      const res = await fetch(
        "https://api.github.com/users/" +
          encodeURIComponent(GITHUB_USER) +
          "/repos?per_page=100",
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) throw new Error("HTTP " + res.status);

      const json = await res.json();
      if (!Array.isArray(json)) throw new Error("unexpected payload");

      // Keep only what the cards need — the raw payload is far too big
      // to sit in sessionStorage.
      const data = {};
      json.forEach((repo) => {
        data[String(repo.full_name).toLowerCase()] = {
          stars: Number(repo.stargazers_count) || 0,
          forks: Number(repo.forks_count) || 0,
        };
      });

      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ at: Date.now(), data })
        );
      } catch (_) { /* storage full/blocked — fine */ }

      return data;
    } catch (err) {
      console.warn("[repos] GitHub fetch failed — cards stay as authored", err);
      return null;
    }
  }

  function fill(card, counts) {
    [
      ["data-repo-stars", counts.stars],
      ["data-repo-forks", counts.forks],
    ].forEach(([attr, n]) => {
      const chip = card.querySelector("[" + attr + "]");
      if (!chip || n <= 0) return;
      const value = chip.querySelector("b");
      if (value) value.textContent = String(n);
      chip.hidden = false;
    });
  }

  async function init() {
    const cards = document.querySelectorAll(".repo-card[data-repo]");
    if (!cards.length) return;

    const data = await fetchRepos();
    if (!data) return;

    cards.forEach((card) => {
      const counts = data[card.dataset.repo.toLowerCase()];
      if (counts) fill(card, counts);
    });
  }

  document.addEventListener("app:ready", init);
})();
