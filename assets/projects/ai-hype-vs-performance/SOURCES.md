# AI Talk vs. AI Results

Published real-data snapshot from https://github.com/hql7-luo/ai-hype-vs-performance, commit `1b3886ddaae74657ceecdc33a52980e90bb83480`. Evidence cutoff: 2026-10-26.

- `explorer.json`: selected fields from `data/processed/panel.csv`; 3,910 filings, 498 issuers. Missing outcomes stay null. Values are preserved without imputation.
- PNGs: original ggplot2 outputs; no visual or numerical edits.
- Full report and linked CSV evidence: copied from the same saved source snapshot.
- The browser explorer aggregates available filing observations by filing year. It does not run R, estimate regressions, or retrieve new SEC/Yahoo data. Shiny remains available in the source repository for local use.

PNG SHA-256:
- `ai_trend.png`: `e8212efe34c7c7e533cee3cc537431191e950cb9017c8f32ec29b22b739bc66d`
- `quintile_outcomes.png`: `0189487c6642ec4e48782f0b434551b31e589553ce742ac70e8f92289349bed5`
- `regression_coefficients.png`: `953abe16c5c53a9c2f11ff46cf66115c9cebc4c649928c340e2893070e54f94c`
