document.addEventListener("DOMContentLoaded", () => {


  // FIX Hire Me Modal (correct IDs)
const hireBtn = document.getElementById("hireBtn");
const hireModal = document.getElementById("hireModal");
const hireClose = document.getElementById("hireClose");

if (hireBtn && hireModal && hireClose) {
  hireBtn.addEventListener("click", () => {
    hireModal.classList.add("open");
  });

  hireClose.addEventListener("click", () => {
    hireModal.classList.remove("open");
  });

  hireModal.addEventListener("click", (e) => {
    if (e.target === hireModal) hireModal.classList.remove("open");
  });
}
const connectForm = document.getElementById("connectForm");


if (connectForm) {
  connectForm.addEventListener("submit", (e) => {
    setTimeout(() => {
      connectModal.classList.remove("open");
      alert("Message sent successfully!");
    }, 500);
  });
}


  /* =========================================================
     1. Multilingual Welcome Overlay (index.html)
     ========================================================= */
  const overlay = document.getElementById("welcomeOverlay");
  const welcomeText = document.getElementById("welcomeText");

  if (overlay && welcomeText) {
    const messages = [
      "⦁Welcome",
      "⦁स्वागत है",
      "⦁স্বাগতম",
      "⦁Добро пожаловать",
      "⦁Bienvenue",
      "⦁Willkommen",
      "⦁Bienvenido"
    ];

    let index = 0;
    welcomeText.textContent = messages[0];

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      welcomeText.textContent = messages[index];
    }, 220);

    setTimeout(() => {
      overlay.classList.add("hidden");
      clearInterval(interval);
    }, 1500);
  }



  /* =========================================================
     2. Smooth Scroll for #anchor links
     ========================================================= */
  document.addEventListener("click", (e) => {
    const target = e.target.closest('a[href^="#"]');
    if (!target) return;

    const id = target.getAttribute("href").slice(1);
    const el = document.getElementById(id);

    if (el) {
      e.preventDefault();
      window.scrollTo({
        top: el.offsetTop - 90,
        behavior: "smooth"
      });
    }
  });



  /* =========================================================
     3. Resume Modal Viewer (about.html)
     ========================================================= */
  const resumeBtn = document.getElementById("resumeBtn");
  const resumeModal = document.getElementById("resumeModal");
  const resumeFrame = document.getElementById("resumeFrame");
  const resumeClose = document.getElementById("resumeClose");

  if (resumeBtn && resumeModal && resumeFrame && resumeClose) {

    const openResume = () => {
      resumeFrame.src = "assets/resume.pdf";
      resumeModal.classList.add("open");
    };

    const closeResume = () => {
      resumeModal.classList.remove("open");
      resumeFrame.src = "";
    };

    resumeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openResume();
    });

    resumeClose.addEventListener("click", closeResume);

    resumeModal.addEventListener("click", (e) => {
      if (e.target === resumeModal) closeResume();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeResume();
    });
  }



  /* =========================================================
     4. Connect Me Modal (index.html + footer)
     ========================================================= */
  const connectBtn = document.getElementById("connectBtn");
  const connectModal = document.getElementById("connectModal");
  const connectClose = document.getElementById("connectClose");
  const connectSend = document.getElementById("connectSend");

  const connectName = document.getElementById("connectName");
  const connectEmail = document.getElementById("connectEmail");
  const connectMessage = document.getElementById("connectMessage");

  // ALSO footer "Say Hello!" → open modal
  const footerHello = document.getElementById("footerHello");

  if (connectModal) {

    if (connectBtn) {
      connectBtn.addEventListener("click", () => {
        connectModal.classList.add("open");
      });
    }

    if (footerHello) {
      footerHello.addEventListener("click", () => {
        connectModal.classList.add("open");
      });
    }

    if (connectClose) {
      connectClose.addEventListener("click", () => {
        connectModal.classList.remove("open");
      });
    }

    connectModal.addEventListener("click", (e) => {
      if (e.target === connectModal) {
        connectModal.classList.remove("open");
      }
    });

    if (connectSend) {
      connectSend.addEventListener("click", () => {
        const nameVal = connectName?.value.trim() || "";
        const emailVal = connectEmail?.value.trim() || "";
        const msgVal = connectMessage?.value.trim() || "";

        if (!nameVal || !emailVal || !msgVal) {
          alert("Please fill in your name, email, and message.");
          return;
        }

        alert("Message sent successfully!");
        connectName.value = "";
        connectEmail.value = "";
        connectMessage.value = "";

        connectModal.classList.remove("open");
      });
    }
  }



  /* =========================================================
     5. Ask Me Anything (about.html sidebar)
     ========================================================= */
  const askInput = document.getElementById("askMessage");
  const sendAskBtn = document.getElementById("sendEmailBtn");
  const successPopup = document.getElementById("successPopup");

  if (askInput && sendAskBtn && successPopup) {
    sendAskBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const message = askInput.value.trim();
      if (!message) {
        alert("Please type your question!");
        return;
      }

      // Show fake success popup
      successPopup.classList.add("show");
      setTimeout(() => successPopup.classList.remove("show"), 2000);

      // Attempt mail app
      const mail = `mailto:bdnatheduknow27@gmail.com?subject=Ask%20Me%20Anything&body=${encodeURIComponent(
        message
      )}`;
      window.location.href = mail;

      askInput.value = "";
    });
  }

});


/* =========================================
   FLOATING PARTICLES inside Hero Section ONLY
   ========================================= */

const particleCanvas = document.getElementById("particleCanvas");
const heroSection = document.querySelector(".hero-section");

if (particleCanvas && heroSection) {
  const ctx = particleCanvas.getContext("2d");

  function resizeCanvas() {
    const rect = heroSection.getBoundingClientRect();
    particleCanvas.width = rect.width;
    particleCanvas.height = rect.height;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const particles = [];
  const totalParticles = 70;

  // create particles
  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < totalParticles; i++) {
      particles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4
      });
    }
  }
  createParticles();

  // mouse interaction
  let mouse = { x: -1000, y: -1000 };

  window.addEventListener("mousemove", (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  // animation
  function animate() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      // wrap edges
      if (p.x < 0) p.x = particleCanvas.width;
      if (p.x > particleCanvas.width) p.x = 0;
      if (p.y < 0) p.y = particleCanvas.height;
      if (p.y > particleCanvas.height) p.y = 0;

      // cursor attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        p.x -= dx / 80;
        p.y -= dy / 80;
      }

      // draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}


// DevTools Hub Visit Button Alert
const devtoolsVisitBtn = document.getElementById("devtoolsVisitBtn");

if (devtoolsVisitBtn) {
  devtoolsVisitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    alert("DevTools Hub website is not built yet.\nComing soon!");
  });
}
