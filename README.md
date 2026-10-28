# Haoqi Luo — Portfolio

Bilingual portfolio for a University of Washington Foster School of Business student, focused on business, data, AI and operations.

**Live site:** [https://hql7-luo.github.io/](https://hql7-luo.github.io/)

## Current production files

GitHub Pages serves the static files from the repository root on `main`:

```text
index.html
projects/
app.js
style.css
assets/
  academic/
  meta/
  projects/
  resume/
    Haoqi_Luo_Resume_EN.pdf
    Haoqi_Luo_Resume_ZH.pdf
.nojekyll
```

Edit these root files directly. There is no package manager, framework bundle, runtime backend or build step. Each HTML page contains its English default markup and an embedded `translations` JSON dictionary with every key the page uses (including shared interface labels); update both languages and the default markup together. Local vanilla JavaScript handles language preference, navigation, motion and image dialogs.

### Design (Interactive Business, October 2026)

The whole site uses one design system defined at the top of `style.css`: colors, native system fonts (SF Pro / PingFang on Apple, Segoe UI / Microsoft YaHei on Windows, a system monospace for labels; no web-font request), type scale, spacing, card radius, motion durations and breakpoints (1180 / 1000 / 900 / 760 / 640 px).

- Homepage: a results board with three tabs (supply chain, LLM pricing analysis, knowledge assistant), three featured cards with Problem / What I did / Takeaway, team coursework rows with a slide thumbnail, and a "More projects" shelf. The shelf moves with drag, the arrow buttons, a trackpad's horizontal swipe or the keyboard arrows; the ordinary mouse wheel always scrolls the page.
- Project pages: back link and position (n / 16), a business-first hero, an "On this page" menu, an image viewer (previous / next, zoom, Escape, focus return), and next / previous project links in homepage order. Analytics, AI-system and product cases use section orders suited to their content.
- `app.js` has three parts: shared behaviour, homepage interactions and project-page interactions. Language priority: a link's `?lang=` value, except after Back / Forward, where the visitor's latest choice wins; otherwise the stored choice, then the browser language.

The ignored `portfolio-v2-demo/`, its generator and local staging/backups are historical files. They contain older content and assets and must not be used to regenerate or overwrite the current production files.

## Content

Personal facts were updated against the supplied English Resume in October 2026. The homepage features three independent projects and three UW team projects:

1. Supply Chain Decision Intelligence — independent project, Oct 2026
2. Marketing Experimentation & Growth Strategy — independent project, Oct 2026
3. Foreign Trade Enterprise Knowledge Assistant — independent project, Sep 2026
4. LLM Price-Performance Analytics — UW IS 451 team project, Apr–Jun 2026
5. AutoZone Workforce Optimization & Demand Forecasting — UW supply chain team project, Sep–Dec 2025
6. Gen Z Consumer Spending Analytics — UW IS 445 team project, Mar–Jun 2025

Ten more projects sit in the "More projects" shelf, in this order: AI Talk vs. AI Results, AI Infrastructure Value Chain, Tariff-Era Sourcing Decision, Chinese Consumer Brands Going Global, NYC Rideshare Economics, LLM Selection & ROI, Customer Investigation Skill, Export Sales Intelligence, FengShui Layout Planner and What to Eat Today. ColorBox AI was removed from the site in October 2026; its source stays in its own repository. Detailed project descriptions preserve accurate information beyond the Resume.

- English and Chinese pages with persisted language preference
- Experience, education, skills and contact sections
- Both Resume download buttons follow the page language: English downloads `Haoqi_Luo_Resume_EN.pdf`, and Chinese downloads `Haoqi_Luo_Resume_ZH.pdf`. Switching languages updates the link, filename, label and accessible description immediately.
- The English Resume is the owner's October 2026 PDF, copied byte for byte; the Chinese Resume is a one-page translation of the same facts. Their SHA-256 values are pinned in `assets/projects/marketing-experimentation-growth-strategy/manifest.json` (`protected_resume_sha256`), so any future replacement must update those values deliberately.
- GitHub and email contact links; LinkedIn is omitted until a verified profile URL is supplied
- Responsive layouts, keyboard focus styles, reduced-motion support and mobile navigation
- Shared navigation labels include the visible wordmark and localized name, and Resume download labels include the visible PDF wording in both languages
- Canonical URLs, hreflang, page metadata, Open Graph fields and a local favicon

The knowledge assistant is a synthetic public demo. Its 92.5% figure is average relevant-source coverage in Top-5 results over 20 synthetic questions in the internal frozen holdback; it is not a production performance claim or independent external validation. The homepage emphasizes human approval before product facts change; four genuine screenshot stages explain the synthetic 144-to-180 example. This is a local extractive prototype, not a generative LLM deployment. Existing architecture, screenshots and evaluation context remain documented in `assets/projects/foreign-trade-enterprise-rag/SOURCES.md`.

AutoZone's approximately $142.7K (~15%) annual labor savings are model estimates. Academic project results and the IS 451 award are attributed to the teams.

Supply Chain Decision Intelligence uses the public FreshRetailNet-50K dataset from Dingdong-Inc: 4.85 million daily observations across 50,000 anonymized store–product series and 97 days. Sales and stockout observations are real source data; sales are normalized. Its replenishment scenarios use explicit assumptions because on-hand inventory, procurement records and supplier data are unavailable. The project source and reproducible setup are at [hql7-luo/supply-chain-decision-intelligence](https://github.com/hql7-luo/supply-chain-decision-intelligence). The bilingual case study starts with the business problem, a source-backed management-action overview and two distinct investigation views: availability severity and sales contribution. All five generated full-data charts and the actual dashboard screenshot remain accessible below the management story. Chart provenance and cross-repository hashes are in `assets/projects/supply-chain-decision-intelligence/SOURCES.md`.

The public [200-series interactive explorer](https://hql7-luo.github.io/demos/supply-chain/) is a separate, nonrepresentative real-data subset: 19,400 observations across 97 days. Its own KPIs are explicitly scoped to that cohort. Static Plotly charts, Top 20/50 queues, forecast inspection and CSV/PNG downloads require no visitor login or Python. The complete six-tab Streamlit app, including planning scenarios, retains local launch instructions in the analytics repository. Rebuild with `scripts/build_web_demo.py` in that repository; the Plotly runtime is served locally under MIT and the source-data adaptation retains CC BY 4.0.

Customer Investigation Skill now has a bilingual case study in the secondary builds section. Its two visual concepts show the implemented investigation workflow and a source-derived fictional Aurora report summary with actual score dimensions. No public web demo or real customer result is claimed. Both language pairs are copied unchanged from the MIT-licensed skill repository; hashes and sources are retained under `assets/projects/foreign-customer-investigation/`.

## Local preview and validation

From the repository root:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000/](http://localhost:8000/). Use `?lang=en` or `?lang=zh` to check either language. Verify the homepage and all sixteen project pages at desktop, tablet and mobile widths; test navigation, language switching, reduced motion, image dialogs, local assets, links and both Resume PDF downloads. Switch English → Chinese → English and confirm each Resume button's destination, download filename and label. Check key dates and statistics against the latest Resume before future updates.

Changes to these local files do not update the public site until they are committed and pushed to the configured GitHub Pages branch.

Search discovery uses `robots.txt` and `sitemap.xml`. Run `node scripts/check-site-navigation.mjs` after adding or renaming a page; CI checks canonical routes, every local link and fragment, and complete sitemap coverage (including the supply-chain explorer).

Bilingual HTML, local and responsive image references, selected visual hashes and image-size limits are checked with `node scripts/check-portfolio-pages.mjs`. B2B, meal-decision and knowledge-governance cases reuse their actual source-project visuals, with provenance in each assets folder. Image dialogs preserve the currently selected mobile image and allow detail inspection.

Supply-chain publication checks run in CI: `node --check demos/supply-chain/demo.js` and `node scripts/check-supply-chain.mjs`. These reconcile the 200-series payload and KPIs, holdout/future forecast splits, bilingual case keys, and chart image hashes.

Marketing Experimentation & Growth Strategy adds a [bilingual decision case](https://hql7-luo.github.io/projects/marketing-experimentation-growth-strategy.html) based on Kevin Hillstrom’s 2008 randomized email challenge: 64,000 customers and two-week outcomes. The bilingual story first explains the business problem, my approach, findings, recommendation and skills in plain language. A purchase-rate overview compares the three apparel email options; the original six charts and full statistical evidence remain in the lower analysis section. The men’s apparel email had the highest purchase rate. A more complex recipient strategy did not prove a reliable advantage over random selection sending the same number of emails, so the simple campaign is the benchmark for a new experiment. Campaign names describe apparel, not customer gender. Financial contribution uses explicit assumptions and is not actual profit or realized growth. No raw or customer-level derived source records are redistributed. Aggregate evidence and chart checksums are preserved under `assets/projects/marketing-experimentation-growth-strategy/`; the reproducible source is [hql7-luo/marketing-experimentation-growth-strategy](https://github.com/hql7-luo/marketing-experimentation-growth-strategy).

Marketing publication checks run with `node scripts/check-marketing-experiment.mjs`: the six frozen analysis PNG/SVG pairs, a separate source-derived overview pair and its rates, aggregate campaign/policy arithmetic, retained numerical evidence, bilingual story order, historical/financial/data-rights limits and protected Resume hashes. The original analysis manifest remains pinned to its source commit; the new overview has a separate manifest and provenance. Existing all-page checks discover the new case automatically.

AI Infrastructure Value Chain is a bilingual industry-analysis case: where the operating profit from AI data-center spending lands across servers, AI chips, foundry, memory, networking, optical and power. It compares 21 companies from CY2022 to the 12 months ending Q2 2026 using SEC EDGAR filings plus TSMC, Innolight and Eoptolink reports. Charts are copied unchanged from the source repository; provenance and hashes are in `assets/projects/ai-infra-value-chain/SOURCES.md`. It is industry analysis, not investment advice. The reproducible source is [hql7-luo/ai-infra-value-chain](https://github.com/hql7-luo/ai-infra-value-chain).

Tariff-Era Sourcing Decision is a bilingual strategy case: should a fictional Zhejiang folding-carton maker keep serving a US customer from China, or move production to Vietnam or Mexico under October 2026 US tariffs (37.5% on Chinese cartons, 12.5% on Vietnamese, 0% on USMCA-qualifying Mexican)? A landed-cost model compares four strategies over five years with four tariff scenarios and a 10,000-run simulation. Tariffs, freight, exchange rates, paperboard prices and wages come from public sources; plant-level costs are labeled assumptions. Charts are copied unchanged from the source repository; provenance and hashes are in `assets/projects/tariff-sourcing-decision/SOURCES.md`. The interactive explorer is served from the project's own GitHub Pages site. It is a cost-only view, not trade, legal or investment advice. The reproducible source is [hql7-luo/tariff-sourcing-decision](https://github.com/hql7-luo/tariff-sourcing-decision).

Chinese Consumer Brands Going Global is a bilingual strategy case: of Pop Mart, MINISO and Mixue, whose overseas model is more replicable? It compares overseas revenue, store counts, store models and margins from FY2023 to 1H2026 using HKEX announcements, company press releases and Mixue's prospectus, keeping each company's own definition of "overseas" (Mixue does not disclose overseas revenue, so its view relies on store counts). A six-dimension scorecard records the evidence for every score and is tested with 10,000 random weightings; the scorecard is an analyst judgment. Charts are copied unchanged from the source repository; provenance and hashes are in `assets/projects/china-brands-going-global/SOURCES.md`. The interactive scorecard is served from the project's own GitHub Pages site. It is industry analysis, not investment advice. The reproducible source is [hql7-luo/china-brands-going-global](https://github.com/hql7-luo/china-brands-going-global).

NYC Rideshare Economics: Uber vs Lyft is a bilingual analytics case: how much of each New York Uber and Lyft base fare stays with the platform after driver pay? It summarizes all 91 monthly NYC TLC High Volume FHV trip files from February 2019 to August 2026 (1.62 billion cleaned Uber and Lyft trips) with DuckDB SQL, then compares gross take by company, trip length, hour, airport trips and a data-inferred congestion zone. Gross take is base fare minus driver pay, not profit; the congestion-zone comparison is descriptive, not a causal estimate. The December 2025 raw trip count matches TLC's published figure, and pooled take rates are close to the UCLA Labor Center's 2019 and 2022 estimates. Charts are copied unchanged from the source repository; provenance and hashes are in `assets/projects/rideshare-platform-economics/SOURCES.md`. The interactive explorer is served from the project's own GitHub Pages site. The reproducible source is [hql7-luo/rideshare-platform-economics](https://github.com/hql7-luo/rideshare-platform-economics).

LLM Selection & ROI for Export Inquiries is a bilingual decision case in the secondary builds section: which LLM should a small exporter use to draft tracker entries for about 500 inquiries a month, and is it worth paying for? Eight models (Claude, GPT, DeepSeek and Kimi) and a no-AI rules baseline answered 80 labeled test inquiries twice, inside agent tools rather than an API, and a break-even ROI model turns critical error rates into monthly net benefit. The inquiries are synthetic and the company is fictional; costs are list-price estimates and labor and error costs are labeled assumptions. Charts are copied unchanged from the source repository and the card image is a screenshot of its calculator; provenance and hashes are in `assets/projects/llm-selection-roi/SOURCES.md`. The calculator is served from the project's own GitHub Pages site. Not financial advice. The reproducible source is [hql7-luo/llm-selection-roi](https://github.com/hql7-luo/llm-selection-roi).

## Business-first presentation and contribution scope

The Supply Chain and RAG case pages use concise business questions, findings, actions and skills before detailed methods. AI tool use is stated once, in the homepage About section: Codex and Claude helped with much of the coding, research and writing, while the owner chose the questions, checked the numbers and decided what the results mean. Individual case pages no longer repeat this note.

The linked Resume PDFs were replaced with the owner's October 2026 versions (English as supplied, Chinese translated from it); website case pages keep their own evaluation wording, and private internship work is not inferred from the public synthetic demo. No full-data risk rule, forecast, frozen RAG benchmark, formal demo behavior or realized financial outcome changed.
