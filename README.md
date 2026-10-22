# ldidintle.co.za

Personal portfolio website for Didintle Makhubedu, focused on Java backend development, SQL database design, Android integration, and full-stack software projects.

## Overview

This is a static portfolio site built with HTML, CSS, and JavaScript. It highlights selected GitHub repositories, technical skills, Android/mobile work, and contact links through an editorial layout, original project illustrations, and an interactive wire sculpture.

## Design and interaction

- `styles.css` holds the shared color, typography, spacing, responsive layouts, and reduced-motion rules. The palette uses dark olive, warm paper, and pale citron.
- `script.js` renders an original torus knot with the Canvas 2D API. Pointer movement gently changes its orientation. Animation stops when the hero leaves the viewport or the tab is hidden, and runs at a maximum of 30 frames per second.
- The motion toggle pauses the sculpture and transitions. The site follows the visitor’s reduced-motion preference, including changes made while the page is open.
- `assets/sculpture-static.svg` provides artwork when JavaScript or Canvas is unavailable. Content, native project details, anchor links, and the native contact form remain usable without JavaScript.
- Project covers in `assets/` are conceptual SVG illustrations, not application screenshots. Repository links and project descriptions document the actual implementations.
- DM Sans and Instrument Serif load from Google Fonts, with local font fallbacks. The existing Formspree integration enhances the contact form; no framework or animation dependency is required.
- UI icons use locally hosted [Heroicons SVGs](assets/icons/README.md) with shared dimensions and inherited theme colors. Navigation arrows and expand/collapse marks do not depend on system font glyphs. The stylesheet URL carries an explicit version for this icon update so browsers request the matching styles after deployment.

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
