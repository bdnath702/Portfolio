/* ==========================================================================
   now.js — "Right now" panel on the About page.

   • Live IST clock via Intl — correct for every visitor worldwide,
     ticks once a minute (a portfolio doesn't need seconds).
   • Latest commit pulled from GitHub's public events API, cached in
     sessionStorage (30 min) — same politeness budget as stats.js.
   • "Now building" / "learning" are edited in the CONFIG below —
     one place to update when your focus changes. Keep it honest:
     a stale "now" panel is worse than none.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------ EDIT ME when your focus changes ------------------ */
  const CONFIG = {
    githubUser: "bdnath702",
    building: "PrivacyTestLab v2 tools",
    buildingSub: "DNS-leak engine rewrite",
    learning: "System design",
    learningSub: "+ Next.js app router",
  };
  /* ---------------------------------------------------------------------- */

  const CACHE_KEY = "gh-last-commit";
  const CACHE_TTL = 30 * 60 * 1000;

  /* ---------------- Clock ---------------- */
  function startClock() {
    const clock = document.getElementById("nowClock");
    const sub = document.getElementById("nowClockSub");
    if (!clock) return;

    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });

    const hourFmt = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });

    function mood(hour) {
      if (hour >= 23 || hour < 5) return "probably still coding";
      if (hour < 9)  return "coffee first";
      if (hour < 17) return "classes + code";
      return "prime shipping hours";
    }

    function tick() {
      const now = new Date();
      clock.textContent = fmt.format(now);
      if (sub) sub.textContent = mood(parseInt(hourFmt.format(now), 10));
    }

    tick();
    // Align updates to the top of each minute.
    setTimeout(function () {
      tick();
      setInterval(tick, 60 * 1000);
    }, (60 - new Date().getSeconds()) * 1000);
  }

  /* ---------------- Time-ago ---------------- */
  function timeAgo(iso) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 3600)   return Math.max(1, Math.floor(s / 60)) + " min ago";
    if (s < 86400)  return Math.floor(s / 3600) + " hours ago";
    if (s < 172800) return "yesterday";
    return Math.floor(s / 86400) + " days ago";
  }

  /* ---------------- Latest commit ---------------- */
  async function fetchLastPush() {
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
          encodeURIComponent(CONFIG.githubUser) + "/events/public",
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) throw new Error("HTTP " + res.status);

      const events = await res.json();
      const push = events.find(function (e) {
        return e.type === "PushEvent" &&
               e.payload && e.payload.commits && e.payload.commits.length;
      });
      if (!push) return null;

      const commit = push.payload.commits[push.payload.commits.length - 1];
      const data = {
        message: String(commit.message || "").split("\n")[0].slice(0, 60),
        repo: String(push.repo && push.repo.name || "")
                .split("/").pop().slice(0, 40),
        when: push.created_at,
      };

      try {
        sessionStorage.setItem(
          CACHE_KEY, JSON.stringify({ at: Date.now(), data })
        );
      } catch (_) { /* ignore */ }

      return data;
    } catch (err) {
      console.warn("[now] GitHub fetch failed — keeping fallback", err);
      return null;
    }
  }

  async function showCommit() {
    const msgEl = document.getElementById("nowCommit");
    const metaEl = document.getElementById("nowCommitMeta");
    if (!msgEl) return;

    const data = await fetchLastPush();
    if (!data) return; // fallback text in the HTML stays — never an error

    msgEl.textContent = data.message;

    if (metaEl) {
      metaEl.textContent = "";
      const dot = document.createElement("span");
      dot.className = "now-live";
      dot.textContent = "● ";
      const text = document.createTextNode(
        timeAgo(data.when) + " · " + data.repo + " · live from GitHub"
      );
      metaEl.append(dot, text);
    }
  }

  /* ---------------- Static config ---------------- */
  function applyConfig() {
    const map = {
      nowBuilding: CONFIG.building,
      nowBuildingSub: CONFIG.buildingSub,
      nowLearning: CONFIG.learning,
      nowLearningSub: CONFIG.learningSub,
    };
    Object.keys(map).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
  }

  document.addEventListener("app:ready", function () {
    startClock();
    applyConfig();
    showCommit();
  });
})();