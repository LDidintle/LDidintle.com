# ldidintle.co.za

Personal portfolio website for Didintle Makhubedu, focused on Java backend development, SQL database design, Android integration, and full-stack software projects.

## Overview

This is a static portfolio site built with HTML, CSS, and JavaScript. It highlights selected GitHub repositories, technical skills, Android/mobile work, and contact links through an editorial layout, original project illustrations, and an interactive wire sculpture.

## Design and interaction

- `styles.css` holds the shared color, typography, spacing, responsive layouts, and reduced-motion rules. The palette uses dark olive, warm paper, and pale citron.
- `script.js` renders an original torus knot with the Canvas 2D API. Pointer movement gently changes its orientation. As you scroll away from the hero, it uncoils into a tapered wire tube that follows the right gutter. Its shape follows native scroll position and its color adapts to the paper/contact sections. Rendering is capped at 30 frames per second, stops in hidden tabs, and settles when scrolling stops below the hero. Point buffers and segment trigonometry are reused; the fully uncoiled form skips knot projection. Layout reads are batched, and the canvas backing store changes only when its dimensions or pixel ratio change.
- At the footer, the wire tube curls around the measured “Didintle” wordmark and brings up its glow as it arrives. The loop remeasures after font loading, resizing, or content-height changes, and reverses as you scroll away.
- “Let’s talk” and “Send a message” use two gentle bounces followed by a rest while visible, finishing after three cycles. Hover, keyboard focus, typing in the form, disabled submission, the global motion toggle, and reduced-motion preferences stop the relevant animations. Small static glows highlight primary actions and project links on hover or keyboard focus. The footer glow uses a fixed shadow with changing opacity.
- `interactions.js` adds one-time masked heading reveals and traces the health waveform and Mapty route as their illustrations enter view. The original SVG images remain visible if animation or fetching is unavailable. The compact navigation returns on upward scrolling, stays visible while focused, and identifies the current section. Mobile labels shorten in the compact bar while preserving accessible names.
- Contact feedback follows the existing Formspree button and status lifecycle: a sending indicator and `aria-busy` accompany submission; successful responses receive a small check animation; network errors offer retry/email guidance. This module does not submit requests or replace provider validation.
- The motion toggle stays available throughout the page. Pausing, or requesting reduced motion, restores the static hero artwork and removes the travelling figure. The site follows preference changes made while the page is open. The decorative canvas never captures pointer input, and section geometry is refreshed after resizing or expanding project details.
- `assets/sculpture-static.svg` provides artwork when JavaScript or Canvas is unavailable. Content, native project details, anchor links, and the native contact form remain usable without JavaScript.
- Project covers in `assets/` are conceptual SVG illustrations, not application screenshots. Repository links and project descriptions document the actual implementations.
- DM Sans and Instrument Serif are hosted locally as WOFF2 subsets with `font-display: swap`. The two hero font faces are preloaded; the regular serif loads on demand. Original font licenses and sources are recorded in [assets/fonts/README.md](assets/fonts/README.md). The existing Formspree integration enhances the contact form; no framework or animation dependency is required.
- UI icons use locally hosted [Heroicons SVGs](assets/icons/README.md) with shared dimensions and inherited theme colors. Navigation arrows and expand/collapse marks do not depend on system font glyphs. Stylesheet and script URLs carry matching explicit versions so browsers request the updated assets after deployment.

The visual direction draws on the immersive composition of [Overworld Audio](https://overworldaudio.com/) and the editorial layouts in [Dribbble’s web design collection](https://dribbble.com/tags/web-design), with original artwork and implementation.

## Featured Projects

- [AI Health Agent](https://github.com/LDidintle/AI-HEALTH-AGENT): Java/JSP health monitoring platform with Android Kotlin live sync, Health Connect/Galaxy Watch workflow, emulator demo feed, live vital markers, trend graphs, hospital portal, and AI-assisted wellness guidance.
- [Varsity Registration](https://github.com/Lesmol/varsity_registration)
- [Health Monitoring App](https://github.com/LDidintle/health_monitoring_app)
- [Mapty Project](https://github.com/LDidintle/Mapty-project)

## Tech Stack

- HTML
- CSS
- JavaScript
- Android Kotlin and Health Connect highlighted in project content
- GitHub Pages ready

## Local Preview

Run a local static server from the repository root:

```sh
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```

## Deployment

The site is ready for GitHub Pages. The repository includes a `CNAME` file for:

```text
ldidintle.co.za
```

See [HOSTING.md](HOSTING.md) for DNS and custom domain setup steps.

## Notes

- Keep project descriptions honest and based on actual repository code.
- Do not commit API keys, database credentials, local environment files, or system files.
- Add screenshots and live demo links as the main projects become more polished.
