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

Edit these root files directly. There is no package manager, framework bundle, runtime backend or build step. Each HTML page contains its English default markup and an embedded `translations` JSON dictionary; update both languages and the default markup together. Local vanilla JavaScript handles language preference, navigation, motion and image dialogs.

The ignored `portfolio-v2-demo/`, its generator and local staging/backups are historical files. They contain older content and assets and must not be used to regenerate or overwrite the current production files.

## Content

Personal facts were updated against the supplied English Resume in October 2026. The homepage prioritizes six projects:

1. Foreign Trade Enterprise Knowledge Assistant — independent project, Sep 2026
2. Marketing Experimentation & Growth Strategy — independent project, Oct 2026
3. Supply Chain Decision Intelligence — independent project, Oct 2026
4. LLM Price-Performance Analytics — UW IS 451 team project, Apr–Jun 2026
5. AutoZone Workforce Optimization & Demand Forecasting — UW supply chain team project, Sep–Dec 2025
6. Gen Z Consumer Spending Analytics — UW IS 445 team project, Mar–Jun 2025

Five independent builds remain in a secondary section, with their selected visuals, technical explanations and verified demo links where available. Detailed project descriptions preserve accurate information beyond the Resume.

- English and Chinese pages with persisted language preference
- Experience, education, skills and contact sections
- Both Resume download buttons follow the page language: English downloads `Haoqi_Luo_Resume_EN.pdf`, and Chinese downloads `Haoqi_Luo_Resume_ZH.pdf`. Switching languages updates the link, filename, label and accessible description immediately.
- The English Resume preserves the supplied PDF; the Chinese Resume translates the same facts.
- GitHub and email contact links; LinkedIn is omitted until a verified profile URL is supplied
- Responsive layouts, keyboard focus styles, reduced-motion support and mobile navigation
- Canonical URLs, hreflang, page metadata, Open Graph fields and a local favicon

The knowledge assistant is a synthetic public demo. Its 92.5% figure is average relevant-source coverage in Top-5 results over 20 held-out synthetic questions; it is not a production performance claim or independent external validation. Existing architecture, screenshots and evaluation context remain documented in `assets/projects/foreign-trade-enterprise-rag/SOURCES.md`.

AutoZone's approximately $142.7K (~15%) annual labor savings are model estimates. Academic project results and the IS 451 award are attributed to the teams.

Supply Chain Decision Intelligence uses the public FreshRetailNet-50K dataset from Dingdong-Inc: 4.85 million daily observations across 50,000 anonymized store–product series and 97 days. Sales and stockout observations are real source data; sales are normalized. Its replenishment scenarios use explicit assumptions because on-hand inventory, procurement records and supplier data are unavailable. The project source and reproducible setup are at [hql7-luo/supply-chain-decision-intelligence](https://github.com/hql7-luo/supply-chain-decision-intelligence). The bilingual case study pairs five generated full-data charts with findings and management decisions, and retains an actual full-data dashboard screenshot. Chart provenance and cross-repository hashes are in `assets/projects/supply-chain-decision-intelligence/SOURCES.md`.

The public [200-series interactive explorer](https://hql7-luo.github.io/demos/supply-chain/) is a separate, nonrepresentative real-data subset: 19,400 observations across 97 days. Its own KPIs are explicitly scoped to that cohort. Static Plotly charts, Top 20/50 queues, forecast inspection and CSV/PNG downloads require no visitor login or Python. The complete six-tab Streamlit app, including planning scenarios, retains local launch instructions in the analytics repository. Rebuild with `scripts/build_web_demo.py` in that repository; the Plotly runtime is served locally under MIT and the source-data adaptation retains CC BY 4.0.

Customer Investigation Skill now has a bilingual case study in the secondary builds section. Its two visual concepts show the implemented investigation workflow and a source-derived fictional Aurora report summary with actual score dimensions. No public web demo or real customer result is claimed. Both language pairs are copied unchanged from the MIT-licensed skill repository; hashes and sources are retained under `assets/projects/foreign-customer-investigation/`.

## Local preview and validation

From the repository root:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000/](http://localhost:8000/). Use `?lang=en` or `?lang=zh` to check either language. Verify the homepage and all eleven project pages at desktop, tablet and mobile widths; test navigation, language switching, reduced motion, image dialogs, local assets, links and both Resume PDF downloads. Switch English → Chinese → English and confirm each Resume button's destination, download filename and label. Check key dates and statistics against the latest Resume before future updates.

Changes to these local files do not update the public site until they are committed and pushed to the configured GitHub Pages branch.

Bilingual HTML, local and responsive image references, selected visual hashes and image-size limits are checked with `node scripts/check-portfolio-pages.mjs`. B2B, meal-decision and knowledge-governance cases reuse their actual source-project visuals, with provenance in each assets folder. Image dialogs preserve the currently selected mobile image and allow detail inspection.

Supply-chain publication checks run in CI: `node --check demos/supply-chain/demo.js` and `node scripts/check-supply-chain.mjs`. These reconcile the 200-series payload and KPIs, holdout/future forecast splits, bilingual case keys, and chart image hashes.

Marketing Experimentation & Growth Strategy adds a [bilingual decision case](https://hql7-luo.github.io/projects/marketing-experimentation-growth-strategy.html) based on Kevin Hillstrom’s 2008 randomized email challenge: 64,000 customers and two-week outcomes. Six generated charts show campaign effects, customer context, exploratory heterogeneity, held-out policy comparisons and assumed cost/capacity sensitivity. Men’s Email is the simple pilot benchmark; the learned segment rule’s advantage over equal-capacity random Men remains uncertain. Financial contribution uses explicit assumptions and is not actual profit or realized growth. No raw or customer-level derived source records are redistributed. Aggregate evidence and chart checksums are preserved under `assets/projects/marketing-experimentation-growth-strategy/`; the reproducible source is [hql7-luo/marketing-experimentation-growth-strategy](https://github.com/hql7-luo/marketing-experimentation-growth-strategy).

Marketing publication checks run with `node scripts/check-marketing-experiment.mjs`: all six PNG/SVG chart hashes, aggregate campaign/policy arithmetic, displayed headline values, bilingual case keys, historical/financial/data-rights limits and protected Resume hashes. Existing all-page checks discover the new case automatically.
