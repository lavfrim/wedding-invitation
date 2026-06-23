(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "150";
  document.body.append(canvas);

  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;
  let hasPointer = false;
  let lastMoveAt = 0;
  let touchFireworkUntil = 0;
  let lastTouchFireworkAt = 0;
  const particles = [];
  const maxParticles = 220;
  const movementWindowMs = 800;
  const touchFireworkDurationMs = 800;
  const touchFireworkIntervalMs = 80;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnParticle() {
    particles.push({
      x: pointerX,
      y: pointerY,
      vx: (Math.random() - 0.5) * 1.3,
      vy: (Math.random() - 0.5) * 1.3,
      life: 1,
      decay: 0.02,
      radius: 1.5 + Math.random() * 2.5,
      color: "255, 255, 102",
    });

    if (particles.length > maxParticles) {
      particles.shift();
    }
  }

  function spawnFirework(x, y) {
    const count = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.014 + Math.random() * 0.01,
        radius: 1.2 + Math.random() * 2.6,
        color: "255, 255, 102",
      });
    }

    if (particles.length > maxParticles) {
      particles.splice(0, particles.length - maxParticles);
    }
  }

  function draw() {
    const now = performance.now();
    const isMoving = hasPointer && now - lastMoveAt <= movementWindowMs;
    const hasTouchFireworks = now <= touchFireworkUntil;

    if (!isMoving && !hasTouchFireworks && particles.length) {
      particles.length = 0;
    }

    context.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      particle.radius *= 0.985;

      if (particle.life <= 0 || particle.radius < 0.2) {
        particles.splice(i, 1);
        continue;
      }

      const alpha = Math.max(particle.life, 0);
      context.beginPath();
      context.fillStyle = `rgba(${particle.color}, ${alpha})`;
      context.shadowColor = "rgba(255, 210, 170, 0.75)";
      context.shadowBlur = 14;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }

    if (isMoving) {
      spawnParticle();
      spawnParticle();
    }

    if (hasTouchFireworks && now - lastTouchFireworkAt >= touchFireworkIntervalMs) {
      lastTouchFireworkAt = now;
      spawnFirework(pointerX, pointerY);
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    hasPointer = true;
    lastMoveAt = performance.now();
  });
  window.addEventListener("mouseleave", () => {
    hasPointer = false;
    particles.length = 0;
  });
  window.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      pointerX = touch.clientX;
      pointerY = touch.clientY;
      hasPointer = true;
      lastMoveAt = performance.now();
      touchFireworkUntil = lastMoveAt + touchFireworkDurationMs;
      spawnFirework(pointerX, pointerY);
    },
    { passive: true },
  );
  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      pointerX = touch.clientX;
      pointerY = touch.clientY;
      hasPointer = true;
      lastMoveAt = performance.now();
      touchFireworkUntil = lastMoveAt + touchFireworkDurationMs;
    },
    { passive: true },
  );
  window.addEventListener(
    "touchend",
    () => {
      hasPointer = false;
      touchFireworkUntil = performance.now() + touchFireworkDurationMs;
    },
    { passive: true },
  );
  window.addEventListener(
    "touchcancel",
    () => {
      hasPointer = false;
      touchFireworkUntil = performance.now() + touchFireworkDurationMs;
    },
    { passive: true },
  );

  resizeCanvas();
  draw();
})();
