/**
 * Render docs/walkthrough.md to docs/walkthrough.pdf via headless Chrome.
 *
 * Pipeline: markdown-it → templated HTML with print CSS → puppeteer pdf().
 * We use Chrome rather than pandoc/LaTeX because:
 *   1. The doc embeds 11 screenshots; Chrome's image rendering is canonical.
 *   2. We already depend on puppeteer-core for the screenshot pipeline, so no
 *      new toolchain to install (pandoc-pdf needs LaTeX, which is heavy).
 *   3. We keep editorial typography decisions in CSS where the rest of the
 *      product lives — no separate LaTeX style file to drift.
 *
 * Run with `npm run docs:pdf`. Output is a single A4 portrait PDF, ~5MB.
 */
import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'docs', 'walkthrough.md');
const OUT = path.join(ROOT, 'docs', 'walkthrough.pdf');
const SCREENSHOT_DIR = path.join(ROOT, 'docs', 'screenshots');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

// Rewrite relative image src to absolute file:// URLs so Chrome can load them
// when the HTML is served via data: URL.
const original = md.renderer.rules.image!;
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');
  if (srcIndex >= 0) {
    const src = token.attrs![srcIndex][1];
    if (!/^https?:\/\//.test(src) && !src.startsWith('file://')) {
      const resolved = path.resolve(path.dirname(SRC), src);
      token.attrs![srcIndex][1] = `file://${resolved}`;
    }
  }
  return original(tokens, idx, options, env, self);
};

const markdown = fs.readFileSync(SRC, 'utf8');
const body = md.render(markdown);

const css = `
  :root {
    --ink:           #0E1116;
    --ink-secondary: #4A4F58;
    --ink-tertiary:  #8B8F96;
    --border:        #E6E4DD;
    --bg:            #FAFAF7;
    --panel:         #F5F4EE;
    --tier-action:   #B23A3A;
    --tier-watch:    #3A6EA5;
  }
  @page { size: A4 portrait; margin: 18mm 16mm 18mm 16mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: #fff; color: var(--ink);
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10.5pt; line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  /* Headings */
  h1 {
    font-family: 'Iowan Old Style', 'Cambria', 'Georgia', serif;
    font-size: 28pt; line-height: 1.1;
    margin: 0 0 16pt; padding-bottom: 6pt;
    border-bottom: 0.5pt solid var(--border);
    letter-spacing: -0.01em;
  }
  h2 {
    font-family: 'Iowan Old Style', 'Cambria', 'Georgia', serif;
    font-size: 17pt; line-height: 1.2;
    margin: 28pt 0 8pt;
    page-break-after: avoid;
    letter-spacing: -0.005em;
  }
  h3 {
    font-size: 13pt; font-weight: 600;
    margin: 20pt 0 6pt;
    page-break-after: avoid;
  }
  /* Body */
  p { margin: 0 0 8pt; }
  strong { color: var(--ink); }
  em { color: var(--ink); }
  /* Lead block immediately under H1 */
  h1 + p, h1 + p + p, h1 + p + p + p {
    color: var(--ink-secondary);
    font-size: 10pt;
  }
  blockquote {
    margin: 10pt 0; padding: 6pt 14pt;
    border-left: 2pt solid var(--ink);
    color: var(--ink-secondary);
    font-style: italic;
    font-size: 10.5pt;
    page-break-inside: avoid;
  }
  /* Code + inline mono */
  code, kbd, samp, pre {
    font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
    font-size: 9pt;
  }
  code {
    background: var(--panel);
    padding: 0.5pt 4pt;
    border-radius: 2pt;
    border: 0.5pt solid var(--border);
  }
  pre {
    background: var(--panel);
    border: 0.5pt solid var(--border);
    padding: 10pt 12pt;
    border-radius: 3pt;
    margin: 10pt 0;
    overflow-x: hidden;
    page-break-inside: avoid;
    font-size: 8.5pt; line-height: 1.4;
  }
  pre code { background: transparent; border: 0; padding: 0; }
  /* Links */
  a { color: var(--tier-watch); text-decoration: none; border-bottom: 0.5pt solid var(--tier-watch); }
  /* Tables */
  table {
    width: 100%; border-collapse: collapse; margin: 12pt 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 0.5pt solid var(--border);
    padding: 5pt 8pt;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--panel);
    font-weight: 600;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-secondary);
  }
  /* Images */
  img {
    display: block;
    max-width: 100%;
    margin: 10pt auto;
    border: 0.5pt solid var(--border);
    border-radius: 3pt;
    box-shadow: 0 1pt 4pt rgba(14,17,22,0.06);
    page-break-inside: avoid;
  }
  /* Lists */
  ul, ol { margin: 6pt 0 8pt 18pt; padding: 0; }
  li { margin: 0 0 4pt; }
  /* Horizontal rule */
  hr {
    border: 0; border-top: 0.5pt solid var(--border);
    margin: 20pt 0;
  }
  /* Print refinements */
  @media print {
    h1, h2, h3 { page-break-after: avoid; }
    img, table, blockquote, pre { page-break-inside: avoid; }
    a { color: var(--ink); border-bottom-color: var(--border); }
  }
`;

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Shell Health Horizon — Walkthrough</title>
  <style>${css}</style>
</head>
<body>${body}</body>
</html>`;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  // Belt-and-braces: wait for every <img> to fully load before printing.
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images).map((img) =>
        img.complete ? Promise.resolve() : new Promise((res) => {
          img.addEventListener('load', () => res(null));
          img.addEventListener('error', () => res(null));
        }),
      ),
    ),
  );
  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-family: sans-serif; font-size: 7pt; color: #8B8F96; width: 100%; padding: 0 16mm;">
      <span style="float: left;">Shell Health Horizon — Walkthrough</span>
      <span style="float: right;">Illustrative prototype</span>
    </div>`,
    footerTemplate: `<div style="font-family: sans-serif; font-size: 7pt; color: #8B8F96; width: 100%; padding: 0 16mm; text-align: center;">
      <span class="pageNumber"></span> / <span class="totalPages"></span>
    </div>`,
  });
  await browser.close();

  const sizeKb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`Wrote ${OUT}  (${sizeKb} KB)`);

  // Sanity check that all referenced screenshots exist.
  const missing = fs.readdirSync(SCREENSHOT_DIR).filter((f) => !markdown.includes(f));
  if (missing.length) console.warn(`(note: screenshots not referenced in markdown: ${missing.join(', ')})`);
})();
