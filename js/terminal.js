/* ==========================================================================
   terminal.js — The easter egg. Press ~ (or click the footer hint) and a
   terminal drops down. Recruiters remember this.

   Security note: every line of output is built with document.createElement
   + textContent. User input is NEVER passed through innerHTML — a terminal
   that echoes input is a textbook XSS vector if you're careless. We're not.
   ========================================================================== */

(function () {
  "use strict";

  const PROMPT = "visitor@bipul.dev:~$";

  /* ---------------- Command registry ---------------- */
  const COMMANDS = {
    help: () => [
      "Available commands:",
      "  whoami      who is this guy",
      "  projects    what I've built",
      "  stack       technologies I use",
      "  socials     where to find me",
      "  resume      open my resume",
      "  hire        let's work together",
      "  contact     send me a message",
      "  theme       toggle dark / light",
      "  clear       clear the screen",
      "  exit        close the terminal",
    ],

    whoami: () => [
      "Bipul Debnath — full-stack developer, CSE undergrad.",
      "Tripura, India. Building PrivacyTestLab (privacytestlab.com).",
      "Fast, secure web experiences — from pixels to production.",
    ],

    projects: () => [
      "PrivacyTestLab   privacy & security testing platform  [2026, live]",
      "Infogenie        AI chatbot on the MERN stack          [2025, live]",
      "LeetCode Java    200+ documented DSA solutions         [2025]",
      "",
      "Full details: projects.html",
    ],

    stack: () => [
      "Frontend   HTML · CSS · JavaScript · React",
      "Backend    Node.js · Express · MongoDB · PHP",
      "Languages  Java · C · C++",
      "Tools      Git · GitHub · Google Cloud",
    ],

    socials: () => [
      "GitHub     github.com/bdnath702",
      "LinkedIn   linkedin.com/in/bipul-debnath-bb5b20338",
      "Web        privacytestlab.com",
    ],

    resume: (term) => {
      term.close();
      if (window.App && App.openModal) App.openModal("resumeModal");
      return [];
    },

    hire: (term) => {
      term.close();
      if (window.App && App.openModal) App.openModal("hireModal");
      return [];
    },

    contact: (term) => {
      term.close();
      if (window.App && App.openModal) App.openModal("connectModal");
      return [];
    },

    theme: () => {
      const btn = document.getElementById("themeToggle");
      if (btn) btn.click();
      return ["Theme toggled."];
    },

    sudo: () => ["Nice try. This incident will be reported. (not really)"],

    clear: (term) => {
      term.clear();
      return [];
    },

    exit: (term) => {
      term.close();
      return [];
    },
  };

  /* ---------------- Styles (self-contained) ---------------- */
  function injectStyles() {
    const css = `
      .terminal-wrap {
        position: fixed;
        inset: 0 0 auto 0;
        z-index: var(--z-modal);
        display: flex;
        justify-content: center;
        padding: var(--sp-4);
        transform: translateY(-110%);
        transition: transform 360ms var(--ease-out);
      }
      .terminal-wrap.open { transform: none; }
      .terminal {
        width: min(680px, 100%);
        max-height: 60dvh;
        display: flex;
        flex-direction: column;
        background: #17140F;
        color: #EDE6DA;
        border: 1px solid var(--line-strong);
        border-radius: var(--r-md);
        box-shadow: var(--shadow-lg);
        font-family: var(--font-mono);
        font-size: 0.82rem;
        line-height: 1.7;
        overflow: hidden;
      }
      .terminal-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 14px;
        border-bottom: 1px solid rgba(237, 230, 218, 0.12);
        color: rgba(237, 230, 218, 0.55);
        font-size: 0.72rem;
        user-select: none;
      }
      .terminal-bar span:first-child { display: flex; gap: 6px; }
      .terminal-bar i {
        width: 10px; height: 10px; border-radius: 50%;
        background: rgba(237, 230, 218, 0.25);
        display: inline-block;
      }
      .terminal-bar i:first-child { background: var(--accent); }
      .terminal-body {
        padding: 14px;
        overflow-y: auto;
        flex: 1;
      }
      .terminal-line { white-space: pre-wrap; word-break: break-word; }
      .terminal-line.is-cmd { color: #FFFFFF; }
      .terminal-line.is-cmd::before {
        content: "${PROMPT} ";
        color: var(--accent);
      }
      .terminal-input-row {
        display: flex;
        gap: 8px;
        padding: 10px 14px;
        border-top: 1px solid rgba(237, 230, 218, 0.12);
      }
      .terminal-input-row label { color: var(--accent); user-select: none; }
      .terminal-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: #FFFFFF;
        font: inherit;
        caret-color: var(--accent);
      }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------------- Terminal object ---------------- */
  function build() {
    injectStyles();

    const wrap = document.createElement("div");
    wrap.className = "terminal-wrap";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Interactive terminal");

    const panel = document.createElement("div");
    panel.className = "terminal";

    const bar = document.createElement("div");
    bar.className = "terminal-bar";
    const dots = document.createElement("span");
    for (let i = 0; i < 3; i++) dots.appendChild(document.createElement("i"));
    const barLabel = document.createElement("span");
    barLabel.textContent = "bipul.dev — terminal (Esc to close)";
    bar.append(dots, barLabel);

    const body = document.createElement("div");
    body.className = "terminal-body";

    const inputRow = document.createElement("div");
    inputRow.className = "terminal-input-row";
    const label = document.createElement("label");
    label.textContent = PROMPT;
    label.setAttribute("for", "terminalInput");
    const input = document.createElement("input");
    input.className = "terminal-input";
    input.id = "terminalInput";
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.maxLength = 80;
    inputRow.append(label, input);

    panel.append(bar, body, inputRow);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    const history = [];
    let histIndex = -1;
    let isOpen = false;
    let lastFocus = null;

    function print(lines, asCommand) {
      lines.forEach((text) => {
        const line = document.createElement("div");
        line.className = "terminal-line" + (asCommand ? " is-cmd" : "");
        line.textContent = text; // textContent ONLY — never innerHTML
        body.appendChild(line);
      });
      body.scrollTop = body.scrollHeight;
    }

    const term = {
      open() {
        if (isOpen) return;
        isOpen = true;
        lastFocus = document.activeElement;
        wrap.classList.add("open");
        if (!body.childElementCount) {
          print(['Welcome. Type "help" to get started.'], false);
        }
        setTimeout(() => input.focus(), 120);
      },
      close() {
        if (!isOpen) return;
        isOpen = false;
        wrap.classList.remove("open");
        if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
      },
      clear() {
        body.replaceChildren();
      },
      get isOpen() {
        return isOpen;
      },
    };

    function run(raw) {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;

      print([raw], true);
      history.push(raw);
      histIndex = history.length;

      const handler = COMMANDS[cmd.split(/\s+/)[0]];
      if (handler) {
        const out = handler(term);
        if (out && out.length) print(out, false);
      } else {
        print([`command not found: ${cmd} — try "help"`], false);
      }
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        run(input.value);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIndex > 0) input.value = history[--histIndex] || "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIndex < history.length - 1) {
          input.value = history[++histIndex] || "";
        } else {
          histIndex = history.length;
          input.value = "";
        }
      }
    });

    return term;
  }

  /* ---------------- Global wiring ---------------- */
  function init() {
    let term = null; // built lazily on first open

    const ensure = () => term || (term = build());

    document.addEventListener("keydown", (e) => {
      // Don't hijack ~ while the visitor is typing somewhere.
      const typing = e.target.closest(
        'input, textarea, select, [contenteditable="true"]'
      );

      if (e.key === "~" && !typing) {
        e.preventDefault();
        const t = ensure();
        t.isOpen ? t.close() : t.open();
      }

      if (e.key === "Escape" && term && term.isOpen) {
        term.close();
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-terminal]")) {
        ensure().open();
      }
    });
  }

  document.addEventListener("app:ready", init);
})();