# Foreign Trade Enterprise RAG assets

Source repository: https://github.com/hql7-luo/foreign-trade-enterprise-rag

Reviewed source revision: `4f19c75b06537eddbaa4b33bb06821eddf8b887b`.
Public release: https://github.com/hql7-luo/foreign-trade-enterprise-rag/releases/tag/v1.0.0

Governance visual reviewed against `757c874316f56701cdeb529054dce149049c688c`.
That revision changes dependencies and runtime support; the recorded UI source and
governance behavior remain unchanged. No application screenshot was reconstructed.

- `03-grounded-product*.webp`: `docs/demo/screenshots/03-grounded-product.png`
- `04-evidence*.webp`: `docs/demo/screenshots/04-evidence.png`
- `08-pending-conflict*.webp`: `docs/demo/screenshots/08-pending-conflict.png`
- `10-master-provenance*.webp`: `docs/demo/screenshots/10-master-provenance.png`
- `architecture.svg`: unchanged copy of `docs/architecture.svg`
- `enterprise-rag-demo.mp4`: unchanged copy of `docs/demo/enterprise-rag-demo.mp4`
- `governance-workflow*.png`: unchanged copies of `docs/demo/governance-workflow.png`
  and its one-column `governance-workflow-mobile.png` alternative,
  generated from six original screenshots by `scripts/build_governance_visual.py`.
  Crops and source/output SHA-256 digests are recorded in
  `docs/demo/governance-workflow.sources.json`; the complete provenance and regeneration
  instructions are in `docs/demo/governance-visual.md` in the source repository.

Standalone screenshots retain the original UI and full frame; only WebP compression and
960px responsive variants differ. The governance montage adds numbering, captions and
arrows around declared crops of the original UI. No AI-generated or reconstructed UI is used.
The case study selects only the governance montage, evidence drawer and architecture;
older assets remain available but are not duplicated in the page's gallery.

All depicted business data belongs to the fully synthetic Northstar Trading public demo, not an actual customer or production deployment. The English-language diagram and recording retain their original language; the portfolio supplies bilingual descriptions and image alternatives.

Case-study claims were checked against README, docs/portfolio_summary.md, docs/architecture.md, docs/benchmark_analysis.md, docs/public_portfolio_release.md, docs/demo_script.md, docs/interview_talking_points.md and evaluation/results/*_first_run.json. The holdback figures use the offline deterministic hash configuration, not the optional neural embedding provider or an independent human blind evaluation.

The repository has not selected an open-source license. This copy is used in its owner's
portfolio under the owner's instruction; public visibility is not a general redistribution license.
