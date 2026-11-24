# Meal walkthrough sources

Source: https://github.com/hql7-luo/what-to-eat-today (MIT).

The portfolio selects only two concepts: the actual four-stage walkthrough and
one actual explained result. `walkthrough.webp` and `walkthrough-mobile.webp` are
unchanged copies of the corresponding files in `public/screenshots/`; the latter
shows the same four steps in one column. `result.webp` is a crop of the actual
`public/screenshots/source/04-result.webp` at (87, 50, 1113, 752), without changing
UI values. `visual-hashes.json` records the source and output digests.

Source screenshots came from a clean demonstration browser and actual application
controls, with the original weighted draw recommending teriyaki chicken rice.
The recorded preferences were budget 20–30 CNY, mild spice, normal diet, one person
and 30 minutes. The sample saved shop is explicitly fictional; dish prices and
preparation times are local references, and food images are existing representative
AI artwork, not real restaurant photography. No ML, nearby-restaurant data, ordering
or measured user improvement is claimed. See source `provenance.json` and the
Pillow combination script for dimensions, capture details and regeneration.

English versions: `walkthrough-en.webp`, `walkthrough-mobile-en.webp` and
`home-en.webp` are unchanged copies of `public/screenshots/walkthrough-en.webp`,
`walkthrough-mobile-en.webp` and `source/en/00-home.webp` from the source repository.
`result-en.webp` is a crop of `public/screenshots/source/en/04-result.webp` at the
same box, (87, 50, 1113, 752). They were captured from the English interface
(commit 27b2f85) the same way, with the same five preferences; that weighted draw
recommended tomato beef brisket rice. English pages show these files; Chinese pages
keep the Chinese images above and `../what-to-eat.webp` for the project card.
