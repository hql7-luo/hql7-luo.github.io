# Marketing experiment chart provenance

These six chart concepts (PNG and SVG) are copied byte-for-byte from the generated aggregate outputs of [Marketing Experimentation & Growth Strategy](https://github.com/hql7-luo/marketing-experimentation-growth-strategy), under `reports/figures/`. Pinned source commit: [`4ee54130564414a15f85316b5807a16508492272`](https://github.com/hql7-luo/marketing-experimentation-growth-strategy/tree/4ee54130564414a15f85316b5807a16508492272). All values are calculated from Kevin Hillstrom's historical 2008 randomized experiment, not invented customer or outcome data.

Original dataset: [Kevin Hillstrom / MineThatData challenge, published March 20, 2008](https://blog.minethatdata.com/2008/03/minethatdata-e-mail-analytics-and-data.html). 64,000 randomized customers, Men's Email / Women's Email / No Email, two-week outcomes. The exact campaign date is not established; this is not current market evidence.

The original publisher invites analysis and public discussion; no explicit raw-data redistribution license was located. No raw CSV, database, customer-level derived records or targeting scores are included here. Only aggregate analytical evidence, derived visualizations and original project code are published. The project code license does not relicense the source data.

`manifest.json` records the source dataset checksum, chart checksums and source-result checksum. `evidence.json` contains source-attributed aggregate audit, statistical contrasts and held-out policy estimates. The primary conversion contrasts use Holm-adjusted p-values, with pointwise confidence intervals. Financial policy values use assumed 40% contribution margin and $0.02/email; they are not actual profit or realized growth.

The paired 50%-capacity segment-versus-random Men's Email interval crosses zero. Higher point estimates do not establish the learned policy's superiority. Chart labels are English; the case supplies English and Chinese findings and decision captions. Existing Resume files and other project claims are unchanged.

## Plain-language purchase-rate overview

The additional `00_purchase_rate_overview.png` / `.svg` pair is copied byte-for-byte from [`reports/figures/` at b672e4e94cf995bda889acf6ba1eb041d9115614](https://github.com/hql7-luo/marketing-experimentation-growth-strategy/tree/b672e4e94cf995bda889acf6ba1eb041d9115614/reports/figures). It is a presentation overview derived from the existing aggregate campaign summary, not a new analytical result.

`overview-manifest.json` is an unchanged copy of the source [`reports/overview_manifest.json`](https://github.com/hql7-luo/marketing-experimentation-growth-strategy/blob/b672e4e94cf995bda889acf6ba1eb041d9115614/reports/overview_manifest.json). `overview-provenance.json` separately pins that source commit, manifest checksum and aggregate campaign-summary checksum. The original `manifest.json`, `evidence.json`, twelve analytical image files and their original source anchor remain unchanged.

Purchase rate means the percentage of randomly assigned shoppers who bought within two weeks: No Email 0.573%, Women’s Apparel Email 0.884%, Men’s Apparel Email 1.253%. The estimated difference of 6.805 additional buying customers per 1,000 is rounded to “about 7” in the case. It is an uncertain estimate from the historical 2008 experiment, not a promise about a current campaign. Apparel labels do not describe customer gender. Buying customers are not the number of orders, spending, revenue or profit.
