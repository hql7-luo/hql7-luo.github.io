# Supply Chain Decision Intelligence visual assets

The five analysis charts are generated from the verified **full FreshRetailNet-50K dataset**: 4,850,000 daily observations, 50,000 anonymized store–product series, 97 days (2024-03-28 through 2024-07-02). They are not charts of the separate 200-series demonstration subset.

- Original data: [Dingdong-Inc / FreshRetailNet-50K](https://huggingface.co/datasets/Dingdong-Inc/FreshRetailNet-50K)
- Pinned source revision: `08c1fab7f9257bc73679d415d65d644165d351d4`
- Data and derived charts: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), attributed to Dingdong-Inc. Chart preparation and presentation by hql7-luo.
- Reproducible chart generator: [`scripts/build_visualizations.py`](https://github.com/hql7-luo/supply-chain-decision-intelligence/blob/main/scripts/build_visualizations.py)
- Generation command: `uv run --extra viz python scripts/build_visualizations.py`
- Reconciled chart evidence: [`docs/evidence/visualizations.json`](https://github.com/hql7-luo/supply-chain-decision-intelligence/blob/main/docs/evidence/visualizations.json)

| File | Scope and measure |
| --- | --- |
| `historical-demand-stockouts.png` | All 97 days; daily normalized observed sales and stockout operating-hour exposure across all 50,000 series. |
| `product-pareto.png` | All 97 days; aggregated normalized observed sales and cumulative contribution across all 865 product IDs. This is observed-volume concentration, not financial ABC. |
| `forecast-comparison.png` | Untouched 2024-06-26 through 2024-07-02 holdout; 350,000 actual / forecast pairs. Fixed SES WAPE 36.0%; per-series validation-selected WAPE 37.4%. |
| `stockout-risk-matrix.png` | 2024-06-05 through 2024-07-02; both sales contribution and stockout exposure use the latest 28 days across all 50,000 series. Existing risk definitions and priority ranks are retained. |
| `availability-zero-sales.png` | All 4.85M store–product days; observed zero-sales and stockout association. This does not recover latent demand or establish causality. |
| `dashboard.png` | Actual local Streamlit screenshot. The caption and visible sidebar identify the full-data scope separately from the 200-series demo. |

Sales use the source's globally normalized scale. No conversion into physical units or revenue is possible from the available fields. No actual inventory, supplier, procurement-cost or realized-savings claims are made. The demonstration subset contains 19,400 real source observations / 200 series and is not population-representative; its metrics must not be presented as full-data conclusions.

The PNG files are copied byte-for-byte from the analysis repository's `docs/assets/` outputs. `chart-hashes.json` records their SHA-256 hashes for cross-repository verification.

## Business overview added October 8, 2026

Reviewed presentation source commit: `8baa6508d493c90513e2e6be77d2706a441e3a82`.

`management-action-overview.svg` and `.png` are the same single overview figure,
copied byte-for-byte from `docs/assets/`. It summarizes saved full-data evidence,
then separates an availability investigation from a high-contribution review.
The latter uses saved sales classes and an existing sales sort; an A-only worklist
is documented, not an added Demo preset or an optimal replenishment policy.
Top 20 / 50 describes review capacity. Streamlit's sales sort uses 97 days;
the static 200-series Demo's sales sort uses the latest 28 days.

`management-action-overview.json` is copied from `docs/evidence/` and records
scope, evidence hash, view definitions and boundaries. `full-data-findings.json`
is an unchanged copy of the source `docs/evidence/findings.json` used to reconcile
the overview in portfolio CI. The five original analysis charts and dashboard
capture retain their existing bytes and definitions. The source revision in
the overview manifest identifies the evidence baseline, not a fresh data run.

The English overview is accompanied by bilingual page explanations and image
alternatives. It records no new operating result, financial metric or forecast.
Project implementation was substantially AI-assisted; the page separately
states the owner's confirmed business requirements and output-review role.
