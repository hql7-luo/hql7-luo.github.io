# Haoqi Luo — Portfolio

Professional portfolio for Haoqi Luo, positioned at the intersection of business analysis, AI applications, and strategy and operations.

**Live site:** [https://hql7-luo.github.io/](https://hql7-luo.github.io/)

## Architecture

The site is intentionally implemented as a lightweight static single page for reliable GitHub Pages deployment:

```text
index.html
styles.css
script.js
assets/
  academic/
  meta/
  projects/
.nojekyll
```

There is no build step, package manager, backend, environment variable, or external JavaScript dependency.

## Content structure

- Hero and professional positioning
- Featured independent products
- Analytics and decision-modeling team projects
- Professional experience
- Categorized capabilities
- Education, honors, and languages
- Contact

Project claims and metrics were verified against current public repositories, the attached resume, and source academic presentations. Independent projects use real interface screenshots; academic cards use selected source-presentation visuals.

## Local preview

Run a static server from the repository root:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## QA targets

- Responsive layouts at 1440px, 1024px, 768px, and 390px
- Semantic HTML and logical heading order
- Keyboard navigation and visible focus states
- Reduced-motion support
- No horizontal overflow
- Valid internal anchors and public project links

## Deployment

GitHub Pages serves the repository root from `main`. The `.nojekyll` file keeps deployment behavior simple and predictable.
