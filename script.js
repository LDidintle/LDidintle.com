const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const motionButton = document.querySelector(".motion-toggle");
let motionPaused = motionPreference.matches;
let updateSculptureMotion = () => {};

function setMotionPaused(paused) {
  motionPaused = paused;
  document.documentElement.classList.toggle("motion-paused", paused);
  if (paused) document.querySelectorAll(".is-entering").forEach((element) => element.classList.remove("is-entering"));
  if (motionButton) {
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.querySelector("[data-motion-label]").textContent = paused ? "Motion off" : "Motion on";
  }
  updateSculptureMotion();
}

if (motionButton) {
  motionButton.hidden = false;
  motionButton.addEventListener("click", () => setMotionPaused(!motionPaused));
}
motionPreference.addEventListener("change", (event) => setMotionPaused(event.matches));
setMotionPaused(motionPaused);

// A reveal is applied only on entry. Missing JS/observer support never hides content.
if ("IntersectionObserver" in window) {
  document.querySelectorAll(".reveal").forEach((element) => {
    element.addEventListener("animationend", () => element.classList.remove("is-entering"));
  });
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!motionPaused) entry.target.classList.add("is-entering");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
}

function initSculpture() {
  const canvas = document.querySelector("#sculpture");
  const hero = document.querySelector(".hero");
  const context = canvas?.getContext("2d");
  if (!context || !hero) return;

  const TAU = Math.PI * 2;
  const ringCount = 160;
  const ringSegments = 32;
  const rings = [];
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  let width = 0;
  let height = 0;
  let angle = 0;
  let frame = 0;
  let lastTime = 0;
  let inView = true;

  // A (2,3) torus knot. Each ring follows a local normal around its centreline.
  function centre(t) {
    const radius = 1.75 + 0.62 * Math.cos(3 * t);
    return [radius * Math.cos(2 * t), radius * Math.sin(2 * t), 0.9 * Math.sin(3 * t)];
  }
  function normalise(vector) {
    const length = Math.hypot(...vector) || 1;
    return vector.map((value) => value / length);
  }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  for (let i = 0; i < ringCount; i++) {
    const t = (i / ringCount) * TAU;
    const point = centre(t);
    const next = centre(t + 0.001);
    const tangent = normalise(next.map((value, axis) => value - point[axis]));
    const normal = normalise(cross(tangent, [0, 0, 1]));
    const binormal = cross(tangent, normal);
    const ring = [];
    for (let j = 0; j < ringSegments; j++) {
      const phase = (j / ringSegments) * TAU;
      ring.push(point.map((value, axis) => value + 0.35 * (normal[axis] * Math.cos(phase) + binormal[axis] * Math.sin(phase))));
    }
    rings.push(ring);
  }

  function draw() {
    const rotationX = 0.72 + tilt.y;
    const rotationY = -0.34 + angle + tilt.x;
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const scale = Math.min(width / 6.3, height / 6.3);
    context.clearRect(0, 0, width, height);

    const projected = rings.map((ring, index) => {
      let depth = 0;
      const points = ring.map(([x, y, z]) => {
        const rx = x * cosY + z * sinY;
        const rz = z * cosY - x * sinY;
        const ry = y * cosX - rz * sinX;
        const finalZ = y * sinX + rz * cosX;
        const perspective = 8 / (8 - finalZ);
        depth += finalZ;
        return [width * 0.5 + rx * scale * perspective, height * 0.51 + ry * scale * perspective];
      });
      return { points, depth: depth / ringSegments, index };
    });

    // Back-to-front strokes keep the knot airy without a WebGL dependency.
    projected.sort((a, b) => a.depth - b.depth);
    for (const ring of projected) {
      const front = Math.max(0, Math.min(1, (ring.depth + 2.5) / 5));
      context.strokeStyle = ring.index % 16 === 0
        ? `rgba(232,160,128,${0.18 + front * 0.48})`
        : `rgba(201,220,165,${0.07 + front * 0.49})`;
      context.lineWidth = ring.index % 16 === 0 ? 0.9 : 0.65;
      context.beginPath();
      ring.points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
      context.closePath();
      context.stroke();
    }

    // A few longitudinal threads reveal the surface between cross-sections.
    const inOrder = [...projected].sort((a, b) => a.index - b.index);
    context.lineWidth = 0.5;
    context.strokeStyle = "rgba(207,225,174,0.17)";
    for (let j = 0; j < ringSegments; j += 4) {
      context.beginPath();
      inOrder.forEach((ring, index) => {
        const [x, y] = ring.points[j];
        index ? context.lineTo(x, y) : context.moveTo(x, y);
      });
      context.closePath();
      context.stroke();
    }
  }

  function animate(time) {
    frame = 0;
    if (motionPaused || !inView || document.hidden) return;
    if (time - lastTime >= 1000 / 30) {
      const elapsed = lastTime ? Math.min(time - lastTime, 80) : 0;
      angle += elapsed * 0.000065;
      tilt.x += (pointer.x - tilt.x) * 0.035;
      tilt.y += (pointer.y - tilt.y) * 0.035;
      draw();
      lastTime = time;
    }
    frame = requestAnimationFrame(animate);
  }
  function updateMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!motionPaused && inView && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw();
  }
  hero.addEventListener("pointermove", (event) => {
    if (motionPaused || event.pointerType !== "mouse") return;
    const bounds = hero.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.36;
    pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.24;
  });
  hero.addEventListener("pointerleave", () => { pointer.x = 0; pointer.y = 0; });
  document.addEventListener("visibilitychange", updateMotion);
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize", resize);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateMotion();
    }).observe(hero);
  }
  updateSculptureMotion = updateMotion;
  resize();
  canvas.parentElement.classList.add("has-sculpture");
  updateMotion();
}
initSculpture();
