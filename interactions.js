(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionIsPaused = () => root.classList.contains("motion-paused") || reducedMotion.matches;
  const transientAnimations = new Map();

  function finishAnimation(element) {
    const animation = transientAnimations.get(element);
    if (!animation) return;
    animation.cleanup();
    element.classList.remove(animation.className);
    transientAnimations.delete(element);
  }

  function animateOnce(element, className, finalTarget) {
    if (motionIsPaused()) return;
    finishAnimation(element);
    const finish = (event) => {
      if (event.target !== finalTarget && event.type !== "animationcancel") return;
      finishAnimation(element);
    };
    transientAnimations.set(element, { className, cleanup() {
      element.removeEventListener("animationend", finish);
      element.removeEventListener("animationcancel", finish);
    } });
    element.addEventListener("animationend", finish);
    element.addEventListener("animationcancel", finish);
    element.classList.add(className);
  }

  function clearMotion() {
    if (motionIsPaused()) [...transientAnimations.keys()].forEach(finishAnimation);
  }
  document.addEventListener("portfolio:motion", clearMotion);
  reducedMotion.addEventListener("change", clearMotion);

  function initHeadingReveals() {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const heading = entry.target;
        const lines = heading.querySelectorAll(".heading-line-inner");
        animateOnce(heading, "is-revealing", lines[lines.length - 1]);
        observer.unobserve(heading);
      }
    }, { threshold: 0.2 });

    document.querySelectorAll("h1, h2").forEach((heading) => {
      const nodes = [...heading.childNodes];
      const directSpans = heading.tagName === "H1" && nodes.every((node) =>
        node.nodeType === Node.TEXT_NODE ? !node.textContent.trim() : node.nodeName === "SPAN"
      );
      const groups = directSpans
        ? nodes.filter((node) => node.nodeType === Node.ELEMENT_NODE).map((node) => [node])
        : [[]];
      if (!directSpans) {
        nodes.forEach((node) => {
          if (node.nodeName === "BR") groups.push([]);
          else groups[groups.length - 1].push(node);
        });
      }
      const fragment = document.createDocumentFragment();
      groups.forEach((group, index) => {
        if (!group.some((node) => node.textContent.trim())) return;
        const line = document.createElement("span");
        const inner = document.createElement("span");
        line.className = "heading-line";
        inner.className = "heading-line-inner";
        line.style.setProperty("--line-index", index);
        group.forEach((node) => inner.append(node));
        line.append(inner);
        fragment.append(line, document.createTextNode(" "));
      });
      heading.replaceChildren(fragment);
      heading.classList.add("heading-reveal");
      observer.observe(heading);
    });
  }

  function initReturningNavigation() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const links = [...header.querySelectorAll('a[href="#projects"], a[href="#about"], a[href="#skills"], a[href="#contact"]')];
    const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    let boundaries = [];
    let directionAnchor = window.scrollY;
    let returning = false;
    let frame = 0;
    let needsMeasure = true;

    function update() {
      frame = 0;
      const scroll = Math.max(0, window.scrollY);
      if (needsMeasure) {
        boundaries = sections.map((section) => ({ id: section.id, top: section.getBoundingClientRect().top + scroll }));
        needsMeasure = false;
      }
      if (scroll <= 180) {
        returning = false;
        directionAnchor = scroll;
      } else if (scroll > directionAnchor + 8) {
        returning = false;
        directionAnchor = scroll;
      } else if (scroll < directionAnchor - 8) {
        returning = true;
        directionAnchor = scroll;
      }
      const docked = scroll > 180;
      header.classList.toggle("is-docked", docked);
      header.classList.toggle("is-returning", docked && (returning || header.contains(document.activeElement)));
      const readingLine = scroll + window.innerHeight * 0.3;
      let active = "";
      for (const section of boundaries) {
        if (readingLine >= section.top) active = section.id;
      }
      links.forEach((link) => {
        if (link.getAttribute("href") === `#${active}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function measure() {
      needsMeasure = true;
      schedule();
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    header.addEventListener("focusin", schedule);
    header.addEventListener("focusout", schedule);
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(measure);
      const main = document.querySelector("main");
      if (main) observer.observe(main);
    }
    document.fonts?.ready.then(measure);
    schedule();
  }

  function initProjectTraces() {
    if (!("IntersectionObserver" in window)) return;
    const svgNamespace = "http://www.w3.org/2000/svg";
    const allowedAssets = new Set(["project-health.svg", "project-mapty.svg"]);
    const states = new Map();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const state = states.get(entry.target);
        state.inView = entry.isIntersecting;
        if (!state.inView) continue;
        if (!state.loading) {
          state.loading = true;
          loadTrace(state);
        }
        startTrace(state);
      }
    }, { threshold: 0.2 });

    function startTrace(state) {
      if (!state.overlay || !state.inView || state.played) return;
      state.played = true;
      const paths = state.overlay.querySelectorAll(".trace-line");
      animateOnce(state.overlay, "is-tracing", paths[paths.length - 1]);
      observer.unobserve(state.image);
    }

    async function loadTrace(state) {
      try {
        const response = await fetch(state.url, { credentials: "same-origin" });
        if (!response.ok) throw new Error("Project illustration unavailable");
        const source = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
        if (source.querySelector("parsererror")) throw new Error("Invalid project illustration");
        const overlay = document.createElementNS(svgNamespace, "svg");
        overlay.classList.add("project-trace");
        overlay.setAttribute("viewBox", "0 0 1000 680");
        overlay.setAttribute("fill", "none");
        overlay.setAttribute("aria-hidden", "true");
        overlay.setAttribute("focusable", "false");
        source.querySelectorAll("path[data-animate-trace]").forEach((original) => {
          const geometry = original.getAttribute("d") || "";
          const stroke = original.getAttribute("stroke") || "";
          if (!geometry || geometry.length > 20000 || !/^[MmLlHhVvCcSsQqTtAaZz0-9eE+.,\s-]+$/.test(geometry)) return;
          if (!/^#[\da-f]{3,8}$/i.test(stroke)) return;
          const path = document.createElementNS(svgNamespace, "path");
          path.classList.add("trace-line");
          path.setAttribute("pathLength", "1");
          path.setAttribute("d", geometry);
          path.setAttribute("stroke", stroke);
          const width = original.getAttribute("stroke-width");
          if (width && /^\d*\.?\d+$/.test(width)) path.setAttribute("stroke-width", width);
          const cap = original.getAttribute("stroke-linecap");
          if (["butt", "round", "square"].includes(cap)) path.setAttribute("stroke-linecap", cap);
          const join = original.getAttribute("stroke-linejoin");
          if (["miter", "round", "bevel"].includes(join)) path.setAttribute("stroke-linejoin", join);
          overlay.append(path);
        });
        if (!overlay.childElementCount) throw new Error("No project trace available");
        state.image.after(overlay);
        state.overlay = overlay;
        startTrace(state);
      } catch {
        // The original local image remains visible if loading or parsing fails.
        observer.unobserve(state.image);
      }
    }

    document.querySelectorAll(".project-cover img").forEach((image) => {
      const url = new URL(image.getAttribute("src"), document.baseURI);
      if (url.origin !== window.location.origin || !allowedAssets.has(url.pathname.split("/").pop())) return;
      states.set(image, { image, url: url.href, inView: false, loading: false, played: false, overlay: null });
      observer.observe(image);
    });
  }

  function initContactFeedback() {
    const form = document.querySelector("#contact-form");
    const submit = form?.querySelector("[data-fs-submit-btn]");
    const contact = form?.closest(".contact-content");
    if (!form || !submit || !contact || !("MutationObserver" in window)) return;
    const success = contact.querySelector("[data-fs-success]");
    const error = contact.querySelector('[data-fs-error=""]');
    const progress = document.createElement("p");
    progress.className = "contact-progress";
    progress.setAttribute("role", "status");
    progress.textContent = "Sending your message…";
    progress.hidden = true;
    form.before(progress);
    let successWasActive = false;
    let wasSending = false;

    function syncSuccess() {
      if (!success) return;
      const active = success.hasAttribute("data-fs-active") && !!success.textContent.trim();
      if (!active || submit.disabled) {
        finishAnimation(success);
        successWasActive = false;
        return;
      }
      let check = success.querySelector(".success-check");
      if (!check) {
        check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        check.classList.add("success-check");
        check.setAttribute("viewBox", "0 0 24 24");
        check.setAttribute("aria-hidden", "true");
        check.setAttribute("focusable", "false");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.classList.add("success-check-line");
        path.setAttribute("d", "M5 12.5 9.5 17 19 7");
        path.setAttribute("pathLength", "1");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        check.append(path);
        success.prepend(check);
      }
      if (!successWasActive) animateOnce(success, "is-celebrating", check.querySelector("path"));
      successWasActive = true;
    }

    function syncSending() {
      const sending = submit.disabled;
      form.setAttribute("aria-busy", String(sending));
      form.classList.toggle("is-sending", sending);
      progress.hidden = !sending;
      if (sending !== wasSending) syncSuccess();
      wasSending = sending;
    }

    new MutationObserver(syncSending).observe(submit, { attributes: true, attributeFilter: ["disabled"] });
    if (success) {
      new MutationObserver(syncSuccess).observe(success, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ["data-fs-active"]
      });
    }
    if (error) {
      const syncError = () => {
        if (error.textContent.trim() === "Failed to fetch") {
          error.textContent = "Your message couldn’t be sent. Please try again, or use the email link on this page.";
        }
      };
      new MutationObserver(syncError).observe(error, { childList: true, subtree: true, characterData: true });
      syncError();
    }
    syncSending();
    syncSuccess();
  }

  initHeadingReveals();
  initReturningNavigation();
  initProjectTraces();
  initContactFeedback();
})();
