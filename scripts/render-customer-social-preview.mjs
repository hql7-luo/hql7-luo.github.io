// Rasterize the existing implemented workflow for social platforms.
// Requires Playwright with a local Chrome installation; no application data changes.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = resolve(root, 'assets/projects/foreign-customer-investigation');
const source = readFileSync(resolve(directory, 'workflow-en.svg'), 'utf8');
const output = resolve(directory, 'social-preview.png');
const workflow = source.replace('<svg ', '<svg style="width:660px;height:auto;display:block" ');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8">
    <style>
      *{box-sizing:border-box}body{margin:0;background:#f4f7f8;color:#182c3c;font-family:Arial,sans-serif}
      main{width:1200px;height:630px;display:flex;align-items:center;gap:24px;padding:24px 36px}
      section{width:444px;flex-shrink:0}h1{font-size:49px;line-height:1.12;margin:0 0 30px;letter-spacing:-1px}
      p{font-size:25px;line-height:1.45;margin:0;color:#536575}
      .type{color:#166b67;font-size:22px;font-weight:700;margin-bottom:22px}
      .author{font-size:19px;margin-top:34px}
    </style><main><section>
      <p class="type">Agent Skill · Python</p>
      <h1>Customer<br>Investigation<br>Skill</h1>
      <p>Agent research.<br>Python validation and export.<br>Evidence gaps stay explicit.</p>
      <p class="author">Haoqi Luo · GitHub: hql7-luo</p>
    </section>${workflow}</main></html>`);
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: output, type: 'png' });
  console.log('Generated assets/projects/foreign-customer-investigation/social-preview.png (1200 × 630).');
} finally {
  await browser.close();
}
