/* ==========================================================================
   hero3d.js — Three.js hero scene.

   A slowly rotating wireframe icosahedron inside a drifting particle
   field, in the brand accent color. Deliberately minimal — geometry as
   texture, not spectacle.

   Engineering rules:
   • Lazy boot after first paint (requestIdleCallback) — never touches LCP.
   • Colors are READ FROM CSS (--scene-line / --scene-fog) and re-read on
     app:themechange → the scene recolors live with the theme toggle.
   • Renders only while the hero is on screen AND the tab is visible.
   • Pointer parallax on desktop; gyroscope drift on mobile where the
     browser exposes it without a permission prompt.
   • Reduced motion → renders a single static frame, no animation loop.
   • DPR capped at 2 — retina crispness without GPU strain.
   ========================================================================== */

(function () {
  "use strict";

  function readSceneColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
      line: styles.getPropertyValue("--scene-line").trim() || "#D85A30",
      fog: styles.getPropertyValue("--scene-fog").trim() || "#FAF6F0",
    };
  }

  function boot() {
    const canvas = document.getElementById("heroScene");
    if (!canvas || typeof THREE === "undefined") return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colors = readSceneColors();

    /* ---------------- Renderer / scene / camera ---------------- */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,       // page background shows through — theme just works
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(colors.fog), 8, 16);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.z = 10;

    /* ---------------- Icosahedron ---------------- */
    const icoMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.line),
      transparent: true,
      opacity: 0.5,
    });
    const ico = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.1, 1)),
      icoMat
    );
    // Push it right of center so it frames the left-aligned hero text.
    ico.position.set(3.4, 0.2, 0);
    scene.add(ico);

    /* ---------------- Particle field ---------------- */
    const COUNT = 340;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i += 3) {
      positions[i]     = (Math.random() - 0.5) * 22; // x
      positions[i + 1] = (Math.random() - 0.5) * 14; // y
      positions[i + 2] = (Math.random() - 0.5) * 10; // z
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: new THREE.Color(colors.line),
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* ---------------- Sizing ---------------- */
    function resize() {
      const { clientWidth: w, clientHeight: h } = canvas;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* ---------------- Input: pointer + gyroscope ---------------- */
    let targetX = 0;
    let targetY = 0;

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (finePointer) {
      window.addEventListener(
        "pointermove",
        (e) => {
          targetX = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 → 1
          targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        },
        { passive: true }
      );
    } else if ("DeviceOrientationEvent" in window &&
               typeof DeviceOrientationEvent.requestPermission !== "function") {
      // Android and browsers that expose orientation without a prompt.
      // (iOS requires a user-gesture permission dialog — a portfolio
      // shouldn't open with a permission request, so iOS gets gentle
      // autonomous drift instead.)
      window.addEventListener(
        "deviceorientation",
        (e) => {
          if (e.gamma === null || e.beta === null) return;
          targetX = Math.max(-1, Math.min(1, e.gamma / 30));
          targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
        },
        { passive: true }
      );
    }

    /* ---------------- Visibility gating ---------------- */
    let heroVisible = true;
    let tabVisible = !document.hidden;

    new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible && !reduced) queueFrame();
      },
      { threshold: 0.05 }
    ).observe(canvas);

    document.addEventListener("visibilitychange", () => {
      tabVisible = !document.hidden;
      if (tabVisible && !reduced) queueFrame();
    });

    /* ---------------- Theme sync ---------------- */
    document.addEventListener("app:themechange", () => {
      const next = readSceneColors();
      icoMat.color.set(next.line);
      pMat.color.set(next.line);
      scene.fog.color.set(next.fog);
      if (reduced) renderer.render(scene, camera); // repaint static frame
    });

    /* ---------------- Animation loop ---------------- */
    let rafId = null;
    let smoothX = 0;
    let smoothY = 0;

    function frame(t) {
      rafId = null;
      if (!heroVisible || !tabVisible) return; // sleep until visible again

      // Ease pointer influence — floaty, never twitchy.
      smoothX += (targetX - smoothX) * 0.04;
      smoothY += (targetY - smoothY) * 0.04;

      ico.rotation.y = t * 0.00012 + smoothX * 0.35;
      ico.rotation.x = t * 0.00008 + smoothY * 0.25;

      particles.rotation.y = t * 0.00002 + smoothX * 0.05;
      particles.position.y = Math.sin(t * 0.00025) * 0.3;

      renderer.render(scene, camera);
      queueFrame();
    }

    function queueFrame() {
      if (rafId === null) rafId = requestAnimationFrame(frame);
    }

    if (reduced) {
      renderer.render(scene, camera); // one static frame, done
    } else {
      queueFrame();
    }
  }

  document.addEventListener("app:ready", () => {
    // Defer past first paint; fall back for browsers without idle callback.
    if ("requestIdleCallback" in window) {
      requestIdleCallback(boot, { timeout: 1500 });
    } else {
      setTimeout(boot, 300);
    }
  });
})();