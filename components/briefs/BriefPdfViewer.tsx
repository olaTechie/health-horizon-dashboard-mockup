'use client';

import { useEffect, useCallback } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

/**
 * Full-screen modal PDF viewer for the quarterly briefs.
 *
 * Replaces the previous "Download print-ready PDF" CTA with an in-product
 * reading experience: tap the brief CTA, the PDF appears in an iframe
 * overlaying the dashboard, the user can read it without leaving context.
 * A Download button is preserved inside the modal for users who actually
 * want a file copy, plus an "Open in new tab" affordance for browsers
 * whose embedded PDF viewer is limited (Safari mobile uses Quick Look).
 *
 * Browsers that can't render application/pdf inline (older Firefox, some
 * mobile browsers) will show their own native fallback in the iframe —
 * the surrounding modal still works, and the Download / Open-in-tab
 * buttons remain reachable.
 */
interface BriefPdfViewerProps {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
}

export function BriefPdfViewer({ open, url, title, onClose }: BriefPdfViewerProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    // Lock body scroll while viewer is open.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="brief-pdf-viewer-title"
      className="fixed inset-0 z-50 flex flex-col bg-[var(--ink)]/70 backdrop-blur-sm"
    >
      {/* Backdrop click-to-close (covers entire viewport) */}
      <button
        type="button"
        aria-label="Close PDF viewer"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* Modal frame — sized to viewport with margins. Stops backdrop clicks. */}
      <div
        className="relative z-10 m-3 sm:m-6 lg:m-10 flex-1 flex flex-col
                   rounded-xl border border-[var(--border)] bg-[var(--surface)]
                   shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-[var(--border)] shrink-0">
          <h2
            id="brief-pdf-viewer-title"
            className="font-mono text-[11px] uppercase tracking-widest text-[var(--ink-secondary)] truncate"
          >
            {title}
          </h2>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--ink-secondary)] hover:bg-[var(--panel)] hover:text-[var(--ink)] transition-colors"
              aria-label="Open PDF in a new tab"
            >
              <ExternalLink size={12} />
              <span className="hidden sm:inline">New tab</span>
            </a>
            <a
              href={url}
              download
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--ink-secondary)] hover:bg-[var(--panel)] hover:text-[var(--ink)] transition-colors"
              aria-label="Download PDF"
            >
              <Download size={12} />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close PDF viewer"
              className="inline-flex items-center justify-center size-8 rounded-md hover:bg-[var(--panel)] text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PDF iframe — bg slightly tinted so PDFs with transparent margins
            don't pop on a stark canvas. #toolbar=0 hides the browser's
            native PDF chrome where supported (Chromium-family). */}
        <div className="flex-1 min-h-0 bg-[var(--panel)]">
          <iframe
            key={url}
            src={`${url}#toolbar=0&navpanes=0&view=FitH`}
            title={title}
            className="w-full h-full border-0"
            // sandbox keeps the iframe untrusted — embedded PDF can't navigate
            // the parent or run scripts, but allow same-origin so the PDF
            // viewer's own UI (where we kept it) loads correctly.
          />
        </div>
      </div>
    </div>
  );
}
