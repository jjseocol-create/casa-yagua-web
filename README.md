# Casa Yagua — Website

Website for **Casa Yagua**: vacation rentals in Cabarete, Dominican Republic. English at the root, Spanish under `/es/`.
Brand and media source files live in the separate repo `casa-yagua-assets`.

## Current status

Static export of the home page designed in the Casa Yagua design canvas:

```
index.html            Home (EN)
index.md              Home (EN) in Markdown, for AI assistants and LLMs
es/index.html         Home (ES)
es/index.md           Home (ES) in Markdown
sitemap.xml           XML sitemap with hreflang en/es (published pages only)
robots.txt            Crawl rules + sitemap location; AI crawlers allowed
llms.txt              Site summary for LLMs (llmstxt.org), links to the .md pages
assets/css/site.css   Styles for every page (brand tokens, layout, animations, booking drawer)
assets/js/site.js     Header (transparent → solid, hides on scroll down), mobile menu, scroll reveals
assets/js/booking.js  Direct booking engine front-end: prices, availability calendar, checkout steps
assets/brand/         Logo and favicon used by the pages
assets/img/           Optimized images used by the pages
assets/video/         Promo video + poster
```

Preview: https://jjseocol-create.github.io/casa-yagua-web/ (GitHub Pages, branch `main`, root). Pages include `noindex` until launch.

## Direct booking

The site's goal is direct bookings at **10% less than the Airbnb price**. Airbnb stays as a secondary option for first-time guests who want the platform's guarantees.

- Prices, discount and Airbnb links: `CONFIG` at the top of `assets/js/booking.js`. Every price on the page (cards, example, mobile bar, booking drawer) is calculated from it. The current rates are **sample values**; also update the static numbers in the `.html` and `.md` files so crawlers see the same prices.
- Connecting the real engine (PMS / channel manager): replace `getBookedNights()` with its availability feed and `submitBooking()` with its checkout, then set `demo: false`.
- Airbnb doesn't allow sending its guests outside the platform. Don't mention the website or the discount in the Airbnb listings or in Airbnb messages; promote it on Google, social media and with returning guests.

## Every new page

1. Add its URL (EN and ES) to `sitemap.xml` with the hreflang links, only once it is published.
2. Write its `.md` version next to the `.html` and list it in `llms.txt`.
3. Check its keyword first in the keyword ownership register (`docs/seo/sitemap-keyword-ownership.md` in the private repo `casa-yagua-assets`).

## Before launch

- Replace the `https://www.airbnb.com/` placeholder links with each apartment's real listing (in the `.html` and `.md` files).
- Replace `#` links with the real URLs from the keyword ownership register (in `casa-yagua-assets`) as pages are built.
- Confirm the domain (`casayagua.com` is used in canonicals, hreflang, sitemap, robots and llms.txt).
- Confirm usage rights for the coast photos (`coast-*.jpg`).
- Remove `<meta name="robots" content="noindex">`.
- Add structured data (LodgingBusiness / VacationRental).
- Keep internal research out of this repo: it is public. SEO docs live in the private repo `casa-yagua-assets/docs/seo/` (`docs/` is in `.gitignore` here).
- Serve `*.md` files with the header `X-Robots-Tag: noindex` so they don't compete with the HTML pages in Google.
- Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## SEO rules (summary)

One primary keyword per URL. Check the keyword ownership register (private repo `casa-yagua-assets`, `docs/seo/`) before creating any new page. The home owns "vacation rentals in Cabarete"; its H2s must not use keywords owned by other pages.
