# Haoqi Luo — Portfolio V2

Bilingual portfolio for Haoqi Luo, focused on AI tools for business decisions and operations.

**Live site:** [https://hql7-luo.github.io/](https://hql7-luo.github.io/)

## Production architecture

GitHub Pages serves the static production output from the repository root on `main`:

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
.nojekyll
```

The production site has no runtime backend, package manager, external JavaScript dependency, or framework bundle. Language switching, motion, navigation, and image dialogs use local vanilla JavaScript and CSS.

## Content and behavior

- Complete Chinese and English experiences with persisted language preference
- Two language-synchronized résumé links backed by the supplied English and Chinese PDF files
- Curated Selected Work and seven bilingual project case studies
- Experience, education, capabilities, and contact sections
- Responsive desktop, tablet, and mobile layouts
- Keyboard focus styles, reduced-motion support, lazy-loaded images, and mobile menu scroll locking
- SEO metadata, canonical URLs, hreflang, Open Graph fields, and a local favicon

LinkedIn is intentionally omitted because no verified profile URL is stored in the project. The Hero and Contact résumé links open the supplied English or Chinese PDF in a new tab according to the active site language.

## Local preview

Run a static server from the repository root:

```bash
python3 -m http.server 8000
```

Open the address printed by the server. Add `?lang=zh` or `?lang=en` to test each language explicitly.

## Source and build

The editable V2 source and build script are retained locally in `portfolio-v2-demo/`. Production output can be regenerated from that directory with:

```bash
node build.mjs --production ../portfolio-v2-production
python3 verify-production.py ../portfolio-v2-production
```

Local source, staging, screenshots, and prior design backups are excluded from the Pages branch so they are not published as public routes.

## Deployment and rollback

GitHub Pages deploys `main` from the repository root. The previous live version is preserved remotely as branch `portfolio-before-v2-deployment` and annotated tag `pre-v2-portfolio`.

For a safe rollback without rewriting history, restore the previous tree into a new commit:

```bash
git switch main
git restore --source=pre-v2-portfolio -- .
git commit -m "Restore portfolio before V2 deployment"
git push origin main
```
