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
  document.dispatchEvent(new CustomEvent("portfolio:motion", { detail: { paused } }));
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
      if (!motionPaused && !entry.target.querySelector(".heading-reveal")) entry.target.classList.add("is-entering");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
  const attentionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-in-view", entry.intersectionRatio >= 0.5));
  }, { threshold: 0.5 });
  document.querySelectorAll(".header-contact, .form-submit").forEach((element) => attentionObserver.observe(element));
}

function initSculpture() {
  const canvas = document.querySelector("#sculpture");
  const hero = document.querySelector(".hero");
  const heroArt = document.querySelector(".hero-art");
  const footerWordmark = document.querySelector(".footer-wordmark");
  const footerName = document.querySelector(".footer-name");
  const context = canvas?.getContext("2d");
  if (!context || !hero || !heroArt) return;

  const TAU = Math.PI * 2;
  const ringCount = 160;
  const ringSegments = 32;
  const rings = [];
  const segmentCos = new Float64Array(ringSegments);
  const segmentSin = new Float64Array(ringSegments);
  const projected = Array.from({ length: ringCount }, (_, index) => ({
    points: new Float64Array(ringSegments * 2), depth: 0, index, light: false
  }));
  const depthOrder = [...projected];
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (start, end, amount) => start + (end - start) * amount;
  const smoothstep = (value) => value * value * (3 - 2 * value);
  let width = 0;
  let height = 0;
  let heroHeight = 0;
  let maxScroll = 0;
  let gutter = 0;
  let artBounds = { left: 0, top: 0, width: 0, height: 0 };
  let lightSections = [];
  let nameBounds = null;
  let orbitRings = [];
  let lastGlow = "";
  let targetScroll = window.scrollY;
  let currentScroll = targetScroll;
  let angle = 0;
  let frame = 0;
  let lastTime = 0;
  let measureFrame = 0;
  let lastPixelRatio = 0;

  // Precompute the original closed knot once. The scroll form is an open tube.
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
  for (let j = 0; j < ringSegments; j++) {
    segmentCos[j] = Math.cos((j / ringSegments) * TAU);
    segmentSin[j] = Math.sin((j / ringSegments) * TAU);
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
      ring.push(point.map((value, axis) => value + 0.35 * (normal[axis] * segmentCos[j] + binormal[axis] * segmentSin[j])));
    }
    rings.push(ring);
  }

  function readScroll() {
    targetScroll = clamp(window.scrollY, 0, maxScroll);
    motionButton?.classList.toggle("is-floating", targetScroll > heroHeight * 0.12);
  }

  function setArrivalGlow(amount) {
    const value = amount.toFixed(3);
    if (!footerWordmark || value === lastGlow) return;
    lastGlow = value;
    footerWordmark.style.setProperty("--arrival-glow", value);
    footerWordmark.classList.toggle("is-energized", amount > 0.12);
  }

  function measureOrbit() {
    if (!nameBounds) return;
    const padding = clamp(gutter * 0.4, 16, 32);
    const centreX = nameBounds.left + nameBounds.width / 2;
    const radiusX = Math.min(nameBounds.width / 2 + padding, centreX - 8, width - centreX - 8);
    const radiusY = nameBounds.height / 2 + padding;
    const contour = [];
    let distance = 0;
    for (let i = 0; i <= 480; i++) {
      const theta = -Math.PI / 2 + (i / 480) * TAU;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      const x = radiusX * Math.sign(cos) * Math.pow(Math.abs(cos), 1 / 3);
      const y = radiusY * Math.sign(sin) * Math.pow(Math.abs(sin), 1 / 3);
      if (i) distance += Math.hypot(x - contour[i - 1].x, y - contour[i - 1].y);
      contour.push({ x, y, distance });
    }
    // Equal arc-length spacing keeps the wire consistent on corners and straight edges.
    let segment = 1;
    orbitRings = Array.from({ length: ringCount }, (_, index) => {
      const target = (index / (ringCount - 1)) * distance * 0.98;
      while (segment < contour.length - 1 && contour[segment].distance < target) segment++;
      const previous = contour[segment - 1];
      const next = contour[segment];
      const length = next.distance - previous.distance;
      const amount = (target - previous.distance) / length;
      return { x: mix(previous.x, next.x, amount), y: mix(previous.y, next.y, amount), tx: (next.x - previous.x) / length, ty: (next.y - previous.y) / length };
    });
  }

  // Read geometry on layout changes, never inside the ring-drawing loop.
  function measure() {
    measureFrame = 0;
    width = window.innerWidth;
    height = window.innerHeight;
    const art = heroArt.getBoundingClientRect();
    artBounds = { left: art.left, top: art.top + window.scrollY, width: art.width, height: art.height };
    heroHeight = hero.offsetHeight;
    gutter = parseFloat(getComputedStyle(document.querySelector("#projects")).paddingRight);
    maxScroll = Math.max(0, document.documentElement.scrollHeight - height);
    lightSections = [...document.querySelectorAll(".paper-section, .contact-section")].map((section) => {
      const bounds = section.getBoundingClientRect();
      return { top: bounds.top + window.scrollY, bottom: bounds.bottom + window.scrollY };
    });
    if (footerName) {
      const name = footerName.getBoundingClientRect();
      nameBounds = { left: name.left, top: name.top + window.scrollY, width: name.width, height: name.height };
      measureOrbit();
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, width <= 700 ? 1.5 : 2);
    const backingWidth = Math.round(width * pixelRatio);
    const backingHeight = Math.round(height * pixelRatio);
    if (canvas.width !== backingWidth || canvas.height !== backingHeight || pixelRatio !== lastPixelRatio) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      lastPixelRatio = pixelRatio;
    }
    readScroll();
    currentScroll = clamp(currentScroll, 0, maxScroll);
    if (!motionPaused && !document.hidden) draw();
    requestFrame();
  }

  function scheduleMeasure() {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  }

  function draw() {
    const morph = smoothstep(clamp((currentScroll / heroHeight - 0.12) / 0.76, 0, 1));
    const rotationX = 0.72 + tilt.y;
    const rotationY = -0.34 + angle + tilt.x;
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const scale = Math.min(artBounds.width / 6.3, artBounds.height / 6.3);
    // The open form fits in the outer gutter, leaving the content interactive and clear.
    const railWidth = clamp(gutter - 8, 20, 100);
    const railX = width - gutter * 0.5;
    const snakeLength = Math.min(width <= 700 ? 250 : 380, height * 0.46);
    const snakeY = height * (0.48 + Math.sin(currentScroll / 1000) * 0.06);
    const amplitude = railWidth * 0.23;
    const phase = currentScroll / 150;
    const dockStart = nameBounds ? clamp(nameBounds.top - height * 0.86, heroHeight, maxScroll - 1) : maxScroll;
    const dock = nameBounds ? smoothstep(clamp((currentScroll - dockStart) / Math.max(1, maxScroll - dockStart), 0, 1)) : 0;
    setArrivalGlow(smoothstep(clamp((dock - 0.55) / 0.4, 0, 1)));
    const orbitX = nameBounds ? nameBounds.left + nameBounds.width / 2 : railX;
    const orbitY = nameBounds ? nameBounds.top - currentScroll + nameBounds.height / 2 : snakeY;
    context.clearRect(0, 0, width, height);

    // Buffers keep a stable order for threads; only references are sorted for depth.
    // Once uncoiled, none of the original knot projection is needed.
    for (let index = 0; index < ringCount; index++) {
      const ring = rings[index];
      const result = projected[index];
      const u = index / (ringCount - 1);
      const wave = u * TAU * 1.1 + phase;
      let snakeX = railX + Math.sin(wave) * amplitude;
      let snakeCentreY = snakeY + (u - 0.5) * snakeLength;
      const dx = Math.cos(wave) * amplitude * TAU * 1.1;
      const length = Math.hypot(dx, snakeLength);
      let tangentX = dx / length;
      let tangentY = snakeLength / length;
      if (dock > 0) {
        const orbit = orbitRings[index];
        snakeX = mix(snakeX, orbitX + orbit.x, dock);
        snakeCentreY = mix(snakeCentreY, orbitY + orbit.y, dock);
        const tx = mix(tangentX, orbit.tx, dock);
        const ty = mix(tangentY, orbit.ty, dock);
        const blendedLength = Math.hypot(tx, ty) || 1;
        tangentX = tx / blendedLength;
        tangentY = ty / blendedLength;
      }
      const cap = Math.min(1, u * 14) * Math.min(1, (1 - u) * 24);
      const radius = mix(railWidth * 0.2, clamp(width * 0.006, 3.5, 9), dock) * (0.24 + 0.76 * Math.pow(1 - u, 0.45)) * cap;
      const snakeDepth = Math.sin(wave) * 0.7;
      let depth = 0;
      let centreY = 0;
      for (let segment = 0; segment < ringSegments; segment++) {
        const across = radius * segmentCos[segment];
        const along = radius * 0.3 * segmentSin[segment];
        let px = snakeX + tangentY * across + tangentX * along;
        let py = snakeCentreY - tangentX * across + tangentY * along;
        if (morph < 1) {
          const [x, y, z] = ring[segment];
          const rx = x * cosY + z * sinY;
          const rz = z * cosY - x * sinY;
          const ry = y * cosX - rz * sinX;
          const finalZ = y * sinX + rz * cosX;
          const perspective = 8 / (8 - finalZ);
          const knotX = artBounds.left + artBounds.width * 0.5 + rx * scale * perspective;
          const knotY = artBounds.top - currentScroll + artBounds.height * 0.51 + ry * scale * perspective;
          px = mix(knotX, px, morph);
          py = mix(knotY, py, morph);
          depth += mix(finalZ, snakeDepth, morph);
        }
        centreY += py;
        result.points[segment * 2] = px;
        result.points[segment * 2 + 1] = py;
      }
      const pageY = centreY / ringSegments + window.scrollY;
      result.light = lightSections.some((section) => pageY >= section.top && pageY < section.bottom);
      result.depth = morph === 1 ? snakeDepth : depth / ringSegments;
    }

    depthOrder.sort((a, b) => a.depth - b.depth);
    for (const ring of depthOrder) {
      const front = clamp((ring.depth + 2.5) / 5, 0, 1);
      const accent = ring.index % 16 === 0;
      const color = ring.light ? (accent ? "126,65,44" : "67,85,48") : (accent ? "232,160,128" : "201,220,165");
      const opacity = mix((accent ? 0.18 : 0.07) + front * 0.49, 0.42 + front * 0.38, morph);
      context.strokeStyle = `rgba(${color},${opacity})`;
      context.lineWidth = accent ? 0.9 : 0.65;
      context.beginPath();
      context.moveTo(ring.points[0], ring.points[1]);
      for (let segment = 1; segment < ringSegments; segment++) {
        context.lineTo(ring.points[segment * 2], ring.points[segment * 2 + 1]);
      }
      context.closePath();
      context.stroke();
    }

    // Split threads at section boundaries so their contrast follows both backgrounds.
    context.lineWidth = 0.5;
    for (let j = 0; j < ringSegments; j += 4) {
      let light = projected[0].light;
      context.strokeStyle = light ? "rgba(67,85,48,0.3)" : "rgba(207,225,174,0.2)";
      context.beginPath();
      for (let index = 0; index < ringCount; index++) {
        const ring = projected[index];
        const x = ring.points[j * 2];
        const y = ring.points[j * 2 + 1];
        if (ring.light !== light) {
          context.lineTo(x, y);
          context.stroke();
          light = ring.light;
          context.strokeStyle = light ? "rgba(67,85,48,0.3)" : "rgba(207,225,174,0.2)";
          context.beginPath();
          context.moveTo(x, y);
        } else if (index) context.lineTo(x, y);
        else context.moveTo(x, y);
      }
      if (morph < 0.001) context.closePath();
      context.stroke();
    }
  }

  function requestFrame() {
    if (!frame && !motionPaused && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function animate(time) {
    frame = 0;
    if (motionPaused || document.hidden) return;
    if (lastTime && time - lastTime < 1000 / 30) {
      requestFrame();
      return;
    }
    const elapsed = lastTime ? Math.min(time - lastTime, 80) : 1000 / 30;
    const easing = 1 - Math.exp(-elapsed / 110);
    currentScroll += (targetScroll - currentScroll) * easing;
    if (Math.abs(targetScroll - currentScroll) < 0.1) currentScroll = targetScroll;
    tilt.x += (pointer.x - tilt.x) * easing;
    tilt.y += (pointer.y - tilt.y) * easing;
    const inHero = currentScroll < heroHeight;
    if (inHero) angle += elapsed * 0.000065;
    draw();
    lastTime = time;
    // Below the hero, the snake settles when scrolling stops instead of running forever.
    if (inHero || currentScroll !== targetScroll) requestFrame();
    else lastTime = 0;
  }
  function updateMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    readScroll();
    currentScroll = targetScroll;
    canvas.hidden = motionPaused;
    if (motionPaused) setArrivalGlow(0);
    heroArt.classList.toggle("has-sculpture", !motionPaused);
    if (!motionPaused && !document.hidden) draw();
    requestFrame();
  }

  window.addEventListener("scroll", () => { readScroll(); requestFrame(); }, { passive: true });
  window.addEventListener("resize", scheduleMeasure);
  window.addEventListener("pageshow", () => { scheduleMeasure(); updateMotion(); });
  hero.addEventListener("pointermove", (event) => {
    if (motionPaused || event.pointerType !== "mouse") return;
    const bounds = hero.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.36;
    pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.24;
    requestFrame();
  });
  hero.addEventListener("pointerleave", () => { pointer.x = 0; pointer.y = 0; });
  document.addEventListener("visibilitychange", updateMotion);
  if ("ResizeObserver" in window) new ResizeObserver(scheduleMeasure).observe(document.body);
  document.fonts?.ready.then(scheduleMeasure);
  // Details expansion changes section positions even when the viewport stays the same size.
  document.querySelectorAll(".project-details").forEach((details) => details.addEventListener("toggle", scheduleMeasure));
  updateSculptureMotion = updateMotion;
  measure();
  updateMotion();
}
initSculpture();
