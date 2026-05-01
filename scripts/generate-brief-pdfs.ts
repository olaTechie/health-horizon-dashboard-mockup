/**
 * Generate the four quarterly Horizon Scanning Brief PDFs from seed content.
 *
 * Why: the deployed `/briefs/*.pdf` files were 46-byte placeholder stubs that
 * would 404 in any PDF reader. The Codex adversarial review (review #2) flagged
 * this as a no-ship: the "Download print-ready PDF" CTA on /briefs is the
 * single most concrete artifact an RFI evaluator can take away from the
 * prototype, and shipping a broken/empty PDF reads as carelessness.
 *
 * Approach: programmatic typesetting with pdfkit, populated from the same
 * seed file that drives the in-product BriefReader. No browser, no build-step
 * coupling — just `npm run generate:briefs` and commit the four PDFs.
 *
 * The output is intentionally austere (Helvetica, A4, two-column-ish spacing)
 * rather than aping the in-product editorial typography. A PDF that "looks
 * like a quarterly brief" lands; a PDF that pretends to be Fraunces and fails
 * does not.
 */
import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { BRIEFS } from './seed/briefs.seed';
import { SIGNALS } from './seed/signals.seed';
import type { Brief, Signal } from '../lib/types';

const OUT_DIR = path.join(process.cwd(), 'public', 'briefs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const COL_X = 56;
const COL_W = 595.28 - COL_X * 2; // A4 portrait minus margins
const TIER_LABEL = { action: 'ACTION', attention: 'ATTENTION', watch: 'WATCH' };

function findSignal(id: string): Signal | undefined {
  return SIGNALS.find((s) => s.id === id);
}

function generate(brief: Brief): string {
  // Derive filename from pdfPath in the seed (e.g. /briefs/2026-Q2.pdf → 2026-Q2.pdf)
  // so the generated artifact matches what BriefReader links to.
  if (!brief.pdfPath) throw new Error(`Brief ${brief.id} has no pdfPath`);
  const fileName = path.basename(brief.pdfPath);
  const filePath = path.join(OUT_DIR, fileName);
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 56, bottom: 56, left: COL_X, right: COL_X },
    info: {
      Title: `Shell Health Horizon — ${brief.quarter} Brief`,
      Author: 'Shell Health Horizon Scanning (illustrative prototype)',
      Subject: `Quarterly Health Horizon Brief, ${brief.quarter}`,
      Keywords: 'horizon scanning, health, PPA, SEAM',
    },
  });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // ─── Cover banner ─────────────────────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#8B8F96')
    .text('SHELL HEALTH HORIZON SCANNING — ILLUSTRATIVE PROTOTYPE', { characterSpacing: 1.2 });
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').fontSize(28).fillColor('#0E1116')
    .text(`${brief.quarter} Quarterly Brief`);

  doc.moveDown(0.25);
  doc.font('Helvetica').fontSize(10).fillColor('#4A4F58')
    .text(`Published ${brief.publishedAt} · ${brief.id}`);

  doc.moveDown(0.5);
  doc.moveTo(COL_X, doc.y).lineTo(COL_X + COL_W, doc.y).strokeColor('#E6E4DD').lineWidth(0.5).stroke();
  doc.moveDown(1.2);

  // ─── Executive Summary ────────────────────────────────────────────────
  section(doc, 'EXECUTIVE SUMMARY');
  doc.font('Helvetica').fontSize(11).fillColor('#0E1116').lineGap(3)
    .text(brief.abstract, { width: COL_W, align: 'left' });
  doc.moveDown(0.8);

  // ─── Key Findings ─────────────────────────────────────────────────────
  section(doc, 'KEY FINDINGS');
  for (const finding of brief.keyFindings) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0E1116').text('•  ', { continued: true });
    doc.font('Helvetica').text(finding, { width: COL_W - 14, lineGap: 2 });
    doc.moveDown(0.3);
  }
  doc.moveDown(0.6);

  // ─── Methodology Note ─────────────────────────────────────────────────
  section(doc, 'METHODOLOGY TRANSPARENCY');
  doc.font('Helvetica').fontSize(10).fillColor('#4A4F58').lineGap(2.5)
    .text(
      'Signals included in this brief were detected through an AI-augmented Living Intelligence Architecture: ' +
      'continuous NLP screening of peer-reviewed literature (PubMed, bioRxiv, Embase), WHO/ECDC outbreak alerts, ' +
      'regulatory dockets (OSHA, NIOSH, HSE, EU-OSHA, OEUK), industry bodies (IOGP, IPIECA), and environmental and ' +
      'social listening streams. Five thematic agents — infectious disease, occupational exposure, regulatory ' +
      'evolution, climate–health interfaces, and psychosocial risk — review their respective domains continuously. ' +
      'Tier escalation requires multi-source triangulation; no single-source signal is escalated. Confidence ' +
      'ratings (low / moderate / high) reflect inclusion-criteria fit, study-design strength, and source ' +
      'corroboration. All escalations carry named expert sign-off.',
      { width: COL_W, align: 'justify' },
    );
  doc.moveDown(0.8);

  // ─── Thematic Deep Dives ──────────────────────────────────────────────
  if (brief.thematicDeepDives.length > 0) {
    section(doc, 'THEMATIC DEEP DIVES');
    for (const dive of brief.thematicDeepDives) {
      ensureSpace(doc, 80);
      doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#0E1116')
        .text(dive.theme, { width: COL_W });
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(10.5).fillColor('#0E1116').lineGap(2.5)
        .text(dive.summary, { width: COL_W });

      doc.moveDown(0.3);
      const refs = dive.signalIds
        .map((id) => {
          const s = findSignal(id);
          return s ? `${s.id} · ${s.title}` : id;
        })
        .join('   |   ');
      doc.font('Helvetica-Oblique').fontSize(9).fillColor('#8B8F96')
        .text(`Cited signals: ${refs}`, { width: COL_W });
      doc.moveDown(0.7);
    }
  }

  // ─── Watchlist Table ──────────────────────────────────────────────────
  if (brief.watchlistSignalIds.length > 0) {
    ensureSpace(doc, 120);
    section(doc, '12-MONTH WATCHLIST');
    drawWatchlistHeader(doc);
    for (const id of brief.watchlistSignalIds) {
      const s = findSignal(id);
      if (!s) continue;
      ensureSpace(doc, 28);
      drawWatchlistRow(doc, s);
    }
    doc.moveDown(1);
  }

  // ─── Sign-off ─────────────────────────────────────────────────────────
  ensureSpace(doc, 80);
  section(doc, 'EXPERT SIGN-OFF');
  for (const person of brief.signedOffBy) {
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0E1116').text(person.name, { continued: true });
    doc.font('Helvetica').fillColor('#4A4F58').text(`   ${person.role}`);
  }
  doc.moveDown(1);

  // ─── Footer disclaimer (every page) ───────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const pageNum = i + 1;
    const total = range.count;
    doc.font('Helvetica').fontSize(7.5).fillColor('#8B8F96')
      .text(
        `Illustrative prototype — signals are real-event-grounded but not vendor-validated. No Shell-specific operational data. Shell Pecten not displayed.`,
        COL_X,
        doc.page.height - 40,
        { width: COL_W - 50, align: 'left' },
      );
    doc.text(`${pageNum} / ${total}`, doc.page.width - COL_X - 30, doc.page.height - 40, {
      width: 30,
      align: 'right',
    });
  }

  doc.end();
  return new Promise<string>((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  }) as unknown as string;
}

function section(doc: typeof PDFDocument.prototype, label: string) {
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#0E1116')
    .text(label, { characterSpacing: 1.5 });
  doc.moveDown(0.15);
  doc.moveTo(COL_X, doc.y).lineTo(COL_X + 40, doc.y).strokeColor('#0E1116').lineWidth(1).stroke();
  doc.moveDown(0.5);
}

function ensureSpace(doc: typeof PDFDocument.prototype, neededPx: number) {
  if (doc.y + neededPx > doc.page.height - 60) doc.addPage();
}

function drawWatchlistHeader(doc: typeof PDFDocument.prototype) {
  const y0 = doc.y;
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#4A4F58');
  doc.text('ID', COL_X, y0, { width: 80, characterSpacing: 1 });
  doc.text('TIER', COL_X + 80, y0, { width: 50, characterSpacing: 1 });
  doc.text('TITLE', COL_X + 130, y0, { width: COL_W - 200, characterSpacing: 1 });
  doc.text('AGENT', COL_X + COL_W - 70, y0, { width: 70, characterSpacing: 1 });
  doc.moveDown(0.4);
  doc.moveTo(COL_X, doc.y).lineTo(COL_X + COL_W, doc.y).strokeColor('#E6E4DD').lineWidth(0.5).stroke();
  doc.moveDown(0.3);
}

function drawWatchlistRow(doc: typeof PDFDocument.prototype, s: Signal) {
  const y0 = doc.y;
  doc.font('Helvetica').fontSize(9).fillColor('#0E1116');
  doc.text(s.id, COL_X, y0, { width: 80 });
  doc.fillColor(
    s.tier === 'action' ? '#B23A3A' : s.tier === 'attention' ? '#C9821B' : '#3A6EA5',
  );
  doc.font('Helvetica-Bold').text(TIER_LABEL[s.tier], COL_X + 80, y0, { width: 50 });
  doc.font('Helvetica').fillColor('#0E1116')
    .text(s.title, COL_X + 130, y0, { width: COL_W - 200 });
  doc.fillColor('#4A4F58').fontSize(8.5)
    .text(s.agent, COL_X + COL_W - 70, y0, { width: 70 });
  doc.fillColor('#0E1116').fontSize(9);
  doc.moveDown(0.45);
}

// ─── main ────────────────────────────────────────────────────────────────
(async () => {
  for (const brief of BRIEFS) {
    const file = await generate(brief);
    console.log(`Wrote ${file}`);
  }
  console.log(`\nGenerated ${BRIEFS.length} brief PDFs.`);
})();
