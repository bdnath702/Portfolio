/* ==========================================================================
   skills-terminal.js — Types the three skill "commands" when the section
   scrolls into view, revealing each output line after its command.

   Progressive enhancement done right:
   • The real text lives in the HTML. If JS never runs, the section is
     simply fully visible — no blank terminal, no SEO loss.
   • JS reads the text, clears it, arms the hidden state, then types.
   • Reduced motion / old browsers → static, instantly visible.
   • textContent only. No innerHTML anywhere near this.
   ========================================================================== */

(function () {
  "use strict";

  const CHAR_MS = 34;      // typing speed per character
  const PAUSE_MS = 420;    // beat between a command finishing and the next

  function init() {
    const terminal = document.getElementById("skillsTerminal");
    if (!terminal) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return; // stay static

    const blocks = Array.from(terminal.querySelectorAll(".st-block"));
    if (!blocks.length) return;

    // Snapshot the final text, then blank the command lines and hide outputs.
    const script = blocks.map((block) => {
      const cmd = block.querySelector(".st-type");
      const out = block.querySelector(".st-out");
      const text = cmd ? cmd.textContent.trim() : "";
      if (cmd) cmd.textContent = "";
      return { cmd, out, text };
    });

    terminal.classList.add("st-armed");

    function typeLine({ cmd, out, text }, done) {
      let i = 0;

      (function tick() {
        i += 1;
        if (cmd) cmd.textContent = text.slice(0, i);

        if (i < text.length) {
          setTimeout(tick, CHAR_MS);
        } else {
          if (out) out.classList.add("show");
          setTimeout(done, PAUSE_MS);
        }
      })();
    }

    function run(index) {
      if (index >= script.length) return;
      typeLine(script[index], () => run(index + 1));
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.disconnect();          // play once, ever
          setTimeout(() => run(0), 250);
        });
      },
      { threshold: 0.35 }
    );

    io.observe(terminal);
  }

  document.addEventListener("app:ready", init);
})();