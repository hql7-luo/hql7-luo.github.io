# Cut Log sources

Source: https://github.com/hql7-luo/cut-log-bilingual at commit 2fa7c31.

`demos/cut-log/index.html` is the repository's single-file offline demo, built with
`npm run build:demo` (`demo.html`, SHA-256 `0579e6202da815656830506732cd621026990c73b8726263a3f03dcea5d8131e`). Three lines were added
after the viewport tag: a canonical link, a description, and a short script that adds
`?lang=` from the portfolio's stored language when the link does not name one. Nothing else
is changed (published SHA-256 `193274240ad3c02b77d5bf1740961707073455c0972d3b6cf980a7e21f62747d`). The demo runs entirely in the
browser with the app's sample records, makes no network requests and registers no service
worker; records stay in that browser's storage.

The screenshots were captured from that hosted demo on 2026-11-24 in a clean headless
Chromium (America/Los_Angeles), in English (`?lang=en`) and Chinese (`?lang=zh`), with the
actual controls:

- `overview-*.webp`: Today view at 1440 × 960, captured at 2x and saved at 2160 × 1440.
  `card-*.webp` is the same capture at 1440 × 960.
- `phone-*.webp`: Today view at 390 × 844, 2x.
- `log-*.webp`: the Log Food dialog after Parse and preview for "For lunch I had 200 g of
  rice and two eggs." / "午饭吃了200克米饭和两个鸡蛋". Nothing was saved.
- `progress-*.webp`: the Weight Change card in Progress, 30-day range.

Every number shown is the demo's sample data, dated relative to the capture day. Food values
are estimates from the built-in list with USDA references. `visual-hashes.json` records each
file's size and SHA-256.
