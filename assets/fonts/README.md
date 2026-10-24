# Local web fonts

These are the unmodified Latin WOFF2 files supplied by Google Fonts for the existing portfolio typefaces, downloaded on 2026-10-22. Hosting them here removes the external font stylesheet and connection dependencies while preserving the typefaces. `fonts.css` uses relative file URLs, `font-display: swap`, and the original Latin Unicode ranges. Characters outside these subsets use the site's fallback fonts.

| File | Use | Bytes | Official source |
| --- | --- | ---: | --- |
| `dm-sans-latin-variable.woff2` | DM Sans normal, weights 400–600 | 36,932 | [Google Fonts v17 WOFF2](https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2) |
| `instrument-serif-latin-italic.woff2` | Instrument Serif italic, weight 400 | 22,128 | [Google Fonts v5 WOFF2](https://fonts.gstatic.com/s/instrumentserif/v5/jizHRFtNs2ka5fXjeivQ4LroWlx-6zAjjH7M.woff2) |
| `instrument-serif-latin-regular.woff2` | Instrument Serif normal, weight 400 | 21,032 | [Google Fonts v5 WOFF2](https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-6zUTjg.woff2) |

Total font binary size: **80,092 bytes**. DM Sans weights 400, 500, and 600 share the same variable font file. The hero uses DM Sans and italic Instrument Serif, making those the two critical preload candidates; regular Instrument Serif remains available for the approach heading.

Both font families are licensed under the **SIL Open Font License 1.1**. Keep the original copyright notices and licenses with the font binaries when redistributing this site:

- [OFL-DM-Sans.txt](OFL-DM-Sans.txt) — Copyright 2014 The DM Sans Project Authors. [Official notice](https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt).
- [OFL-Instrument-Serif.txt](OFL-Instrument-Serif.txt) — Copyright 2022 The Instrument Serif Project Authors. [Official notice](https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentserif/OFL.txt).

The files were validated against the source byte counts and the WOFF2 `wOF2` signature. Browser font loading and layout checks must also pass before claiming an improvement in rendering performance.
