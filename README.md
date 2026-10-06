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

Personal facts were updated against the supplied English Resume in October 2026. The homepage prioritizes five projects:

1. Foreign Trade Enterprise Knowledge Assistant — independent project, Sep 2026
2. Supply Chain Decision Intelligence — independent project, Oct 2026
3. LLM Price-Performance Analytics — UW IS 451 team project, Apr–Jun 2026
4. AutoZone Workforce Optimization & Demand Forecasting — UW supply chain team project, Sep–Dec 2025
5. Gen Z Consumer Spending Analytics — UW IS 445 team project, Mar–Jun 2025

Four existing independent builds remain in a secondary section, with their screenshots, technical explanations and demo links. Detailed project descriptions preserve accurate information beyond the Resume.

- English and Chinese pages with persisted language preference
- Experience, education, skills and contact sections
- Both Resume download buttons follow the page language: English downloads `Haoqi_Luo_Resume_EN.pdf`, and Chinese downloads `Haoqi_Luo_Resume_ZH.pdf`. Switching languages updates the link, filename, label and accessible description immediately.
- The English Resume preserves the supplied PDF; the Chinese Resume translates the same facts.
- GitHub and email contact links; LinkedIn is omitted until a verified profile URL is supplied
- Responsive layouts, keyboard focus styles, reduced-motion support and mobile navigation
- Canonical URLs, hreflang, page metadata, Open Graph fields and a local favicon

The knowledge assistant is a synthetic public demo. Its 92.5% figure is average relevant-source coverage in Top-5 results over 20 held-out synthetic questions; it is not a production performance claim or independent external validation. Existing architecture, screenshots and evaluation context remain documented in `assets/projects/foreign-trade-enterprise-rag/SOURCES.md`.

AutoZone's approximately $142.7K (~15%) annual labor savings are model estimates. Academic project results and the IS 451 award are attributed to the teams.

Supply Chain Decision Intelligence uses the public FreshRetailNet-50K dataset from Dingdong-Inc: 4.85 million daily observations across 50,000 anonymized store–product series and 97 days. Sales and stockout observations are real source data; sales are normalized. Its replenishment scenarios use explicit assumptions because on-hand inventory, procurement records and supplier data are unavailable. The project source and reproducible setup are at [hql7-luo/supply-chain-decision-intelligence](https://github.com/hql7-luo/supply-chain-decision-intelligence). The case study uses an actual dashboard screenshot in `assets/projects/supply-chain-decision-intelligence/dashboard.png`.

## Local preview and validation

From the repository root:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000/](http://localhost:8000/). Use `?lang=en` or `?lang=zh` to check either language. Verify the homepage and all nine project pages at desktop, tablet and mobile widths; test navigation, language switching, reduced motion, image dialogs, local assets, links and both Resume PDF downloads. Switch English → Chinese → English and confirm each Resume button's destination, download filename and label. Check key dates and statistics against the latest Resume before future updates.

Changes to these local files do not update the public site until they are committed and pushed to the configured GitHub Pages branch.
