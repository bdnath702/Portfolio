// ======================================
// LOAD COMPONENTS
// ======================================

async function loadComponents() {

  // HEADER
  const header =
    await fetch("components/header.html");

  const headerData =
    await header.text();

  const headerEl =
    document.getElementById("header");

  if (headerEl) {

    headerEl.innerHTML = headerData;

  }


  // FOOTER
  const footer =
    await fetch("components/footer.html");

  const footerData =
    await footer.text();

  const footerEl =
    document.getElementById("footer");

  if (footerEl) {

    footerEl.innerHTML = footerData;

  }


  // INIT LUCIDE ICONS
  lucide.createIcons();


  // INIT FEATURES
  initThemeToggle();

  initMobileMenu();

  initResumeButtons();

  initConnectModal();

  initHireModal();

}


// LOAD COMPONENTS AFTER PAGE LOAD
window.addEventListener("load", () => {

  loadComponents();

});




function initResumeButtons() {

  const resumeBtn =
    document.getElementById("resumeBtn");

  const mobileResumeBtn =
    document.getElementById("mobileResumeBtn");

  const resumeModal =
    document.getElementById("resumeModal");

  const resumeClose =
    document.getElementById("resumeClose");

  const openResume = () => {

    if (resumeModal) {

      resumeModal.classList.add("open");

    }

  };


  const closeResume = () => {

    if (resumeModal) {

      resumeModal.classList.remove("open");

    }

  };


  // DESKTOP
  if (resumeBtn) {

    resumeBtn.addEventListener("click", openResume);

  }


  // MOBILE
  if (mobileResumeBtn) {

    mobileResumeBtn.addEventListener("click", openResume);

  }


  // CLOSE
  if (resumeClose) {

    resumeClose.addEventListener("click", closeResume);

  }


  // OUTSIDE CLICK
  if (resumeModal) {

    resumeModal.addEventListener("click", (e) => {

      if (e.target === resumeModal) {

        closeResume();

      }

    });

  }

}
// ======================================
// THEME TOGGLE
// ======================================

function initThemeToggle() {

  const themeToggle =
    document.getElementById("themeToggle");

  if (!themeToggle) return;

  const savedTheme =
    localStorage.getItem("theme");

  if (savedTheme === "dark") {

  document.documentElement.classList.add("dark-theme");

  }

  themeToggle.addEventListener("click", () => {

    document.documentElement.classList.toggle("dark-theme");

    const isDark =
      document.documentElement.classList.contains("dark-theme");

    localStorage.setItem(
      "theme",
      isDark ? "dark" : "light"
    );

  });

}





// ======================================
// MOBILE SIDEBAR
// ======================================

function initMobileMenu() {

  const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

  const mobileSidebar =
    document.getElementById("mobileSidebar");

  const closeSidebarBtn =
    document.getElementById("closeSidebarBtn");

  if (!mobileMenuBtn || !mobileSidebar) return;


  // OPEN
  mobileMenuBtn.addEventListener("click", () => {

    mobileSidebar.classList.add("open");

  });


  // CLOSE
  if (closeSidebarBtn) {

    closeSidebarBtn.addEventListener("click", () => {

      mobileSidebar.classList.remove("open");

    });

  }


  // OUTSIDE CLICK
  document.addEventListener("click", (e) => {

    if (
      mobileSidebar.classList.contains("open") &&
      !mobileSidebar.contains(e.target) &&
      !mobileMenuBtn.contains(e.target)
    ) {

      mobileSidebar.classList.remove("open");

    }

  });

}





// ======================================
// RESUME BUTTONS
// ======================================

function initResumeButtons() {

  const resumeBtn =
    document.getElementById("resumeBtn");

  const mobileResumeBtn =
    document.getElementById("mobileResumeBtn");

  const openResume = () => {

    window.open(
      "assets/resume.pdf",
      "_blank"
    );

  };


  if (resumeBtn) {

    resumeBtn.addEventListener("click", (e) => {

      e.preventDefault();

      openResume();

    });

  }


  if (mobileResumeBtn) {

    mobileResumeBtn.addEventListener("click", (e) => {

      e.preventDefault();

      openResume();

    });

  }

}





// ======================================
// CONNECT MODAL
// ======================================

function initConnectModal() {

  const connectBtn =
    document.getElementById("connectBtn");

  const mobileConnectBtn =
    document.getElementById("mobileConnectBtn");

  const footerHello =
    document.getElementById("footerHello");

  const connectModal =
    document.getElementById("connectModal");

  const connectClose =
    document.getElementById("connectClose");

  if (!connectModal) return;


  const openModal = () => {

    connectModal.classList.add("open");

  };


  const closeModal = () => {

    connectModal.classList.remove("open");

  };


  // DESKTOP BUTTON
  if (connectBtn) {

    connectBtn.addEventListener("click", openModal);

  }


  // MOBILE BUTTON
  if (mobileConnectBtn) {

    mobileConnectBtn.addEventListener("click", openModal);

  }


  // FOOTER SAY HELLO
  if (footerHello) {

    footerHello.addEventListener("click", openModal);

  }


  // CLOSE BUTTON
  if (connectClose) {

    connectClose.addEventListener("click", closeModal);

  }


  // CLICK OUTSIDE
  connectModal.addEventListener("click", (e) => {

    if (e.target === connectModal) {

      closeModal();

    }

  });

}





// ======================================
// HIRE MODAL
// ======================================

function initHireModal() {

  const hireBtn =
    document.getElementById("hireBtn");

  const hireModal =
    document.getElementById("hireModal");

  const hireClose =
    document.getElementById("hireClose");

  const hireForm =
    document.getElementById("hireForm");

  const hireSuccess =
    document.getElementById("hireSuccess");

  if (!hireBtn || !hireModal || !hireClose) return;


  // OPEN
  hireBtn.addEventListener("click", () => {

    hireModal.classList.add("open");

  });


  // CLOSE
  hireClose.addEventListener("click", () => {

    hireModal.classList.remove("open");

  });


  // OUTSIDE CLICK
  hireModal.addEventListener("click", (e) => {

    if (e.target === hireModal) {

      hireModal.classList.remove("open");

    }

  });


  // SUCCESS POPUP
  if (hireForm && hireSuccess) {

    hireForm.addEventListener("submit", () => {

      setTimeout(() => {

        hireSuccess.classList.add("show");

        setTimeout(() => {

          hireSuccess.classList.remove("show");

        }, 2500);

      }, 400);

    });

  }

}





// ======================================
// DOM CONTENT LOADED
// ======================================

document.addEventListener("DOMContentLoaded", () => {


  // ======================================
  // WELCOME OVERLAY
  // ======================================

  const overlay =
    document.getElementById("welcomeOverlay");

  const welcomeText =
    document.getElementById("welcomeText");

  if (overlay && welcomeText) {

    const messages = [

      "⦁Welcome",
      "⦁स्वागत है",
      "⦁স্বাগতম",
      "⦁Bienvenue",
      "⦁Willkommen",
      "⦁Bienvenido"

    ];

    let index = 0;

    welcomeText.textContent = messages[0];

    const interval = setInterval(() => {

      index =
        (index + 1) % messages.length;

      welcomeText.textContent =
        messages[index];

    }, 220);


    setTimeout(() => {

      overlay.classList.add("hidden");

      clearInterval(interval);

    }, 1500);

  }




  // ======================================
  // SMOOTH SCROLL
  // ======================================

  document.addEventListener("click", (e) => {

    const target =
      e.target.closest('a[href^="#"]');

    if (!target) return;

    const id =
      target.getAttribute("href").slice(1);

    const el =
      document.getElementById(id);

    if (el) {

      e.preventDefault();

      window.scrollTo({

        top: el.offsetTop - 90,
        behavior: "smooth"

      });

    }

  });




  // ======================================
  // TECH MARQUEE DUPLICATE
  // ======================================

  const marquee =
    document.getElementById("marqueeRow");

  if (marquee) {

    marquee.innerHTML += marquee.innerHTML;

  }




  // ======================================
  // ASK ME ANYTHING
  // ======================================

  const askInput =
    document.getElementById("askMessage");

  const sendAskBtn =
    document.getElementById("sendEmailBtn");

  const successPopup =
    document.getElementById("successPopup");

  if (askInput && sendAskBtn && successPopup) {

    sendAskBtn.addEventListener("click", (e) => {

      e.preventDefault();

      const message =
        askInput.value.trim();

      if (!message) {

        alert("Please type your question!");

        return;

      }

      successPopup.classList.add("show");

      setTimeout(() => {

        successPopup.classList.remove("show");

      }, 2000);


      const mail =
        `mailto:bdnatheduknow27@gmail.com?subject=Ask%20Me%20Anything&body=${encodeURIComponent(message)}`;

      window.location.href = mail;

      askInput.value = "";

    });

  }

});






// ======================================
// FLOATING PARTICLES
// ======================================

const particleCanvas =
  document.getElementById("particleCanvas");

const heroSection =
  document.querySelector(".hero-section");

if (particleCanvas && heroSection) {

  const ctx =
    particleCanvas.getContext("2d");

  function resizeCanvas() {

    const rect =
      heroSection.getBoundingClientRect();

    particleCanvas.width =
      rect.width;

    particleCanvas.height =
      rect.height;

  }

  resizeCanvas();

  window.addEventListener(
    "resize",
    resizeCanvas
  );

  const particles = [];

  const totalParticles =
    window.innerWidth < 768 ? 35 : 70;


  function createParticles() {

    particles.length = 0;

    for (let i = 0; i < totalParticles; i++) {

      particles.push({

        x: Math.random() * particleCanvas.width,

        y: Math.random() * particleCanvas.height,

        size: Math.random() * 2 + 1,

        speedX:
          (Math.random() - 0.5) * 0.4,

        speedY:
          (Math.random() - 0.5) * 0.4,

        opacity:
          Math.random() * 0.5 + 0.2

      });

    }

  }

  createParticles();


  function animateParticles() {

    ctx.clearRect(
      0,
      0,
      particleCanvas.width,
      particleCanvas.height
    );

    particles.forEach((p) => {

      p.x += p.speedX;

      p.y += p.speedY;

      if (
        p.x < 0 ||
        p.x > particleCanvas.width
      ) {

        p.speedX *= -1;

      }

      if (
        p.y < 0 ||
        p.y > particleCanvas.height
      ) {

        p.speedY *= -1;

      }

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.size,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(255,255,255,${p.opacity})`;

      ctx.fill();

    });

    requestAnimationFrame(
      animateParticles
    );

  }

  animateParticles();

}