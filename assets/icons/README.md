# Local icons

The eight Heroicons SVGs in this directory are the original optimized 24px solid assets from [Tailwind Labs](https://github.com/tailwindlabs/heroicons/tree/master/optimized/24/solid), used under the included MIT [LICENSE](LICENSE). They are served locally, without a CDN or JavaScript dependency.

The site uses arrow-up-right for navigation (rotated where needed), chat-bubble-left-right for the contact link, and envelope/inbox for email. Phone, receipt-refund, calendar-days, and document-arrow-down are available for future features with matching actions.

Decorative spans use the shared `.icon` class, a named icon class, and `aria-hidden="true"`. CSS masks inherit `currentColor`; both standard and WebKit mask declarations are included. The submit icon uses `::after` because Formspree restores the button's text after a request and removes nested elements.

`asterisk.svg` is an original decorative mark for this portfolio, separate from Heroicons. Expand/collapse marks and motion bars use CSS geometry.
