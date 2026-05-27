/**
 * CogLens — PDF Text Extraction
 *
 * Uses pdf-parse v1.x for reliable text extraction.
 * Imports from lib/pdf-parse.js directly to avoid the index.js
 * test-file-loading bug (it tries to read a test PDF on import).
 *
 * Includes robust fallback handling for edge-case PDFs that trigger
 * internal pdfjs parser errors (e.g. "Command token too long").
 */

const MAX_TEXT_LENGTH = 100_000;

interface PdfExtractionResult {
  text: string;
  pageCount: number;
  info: Record<string, string>;
}

/**
 * Primary extraction path using pdf-parse.
 * Wraps the low-level parser with proper error handling.
 */
async function primaryExtraction(buffer: Buffer): Promise<PdfExtractionResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse/lib/pdf-parse.js');

  const data = await pdfParse(buffer);

  console.log('[pdf] Primary parse complete — pages:', data.numpages, 'text length:', data.text?.length);

  const info: Record<string, string> = {};
  if (data.info) {
    if (data.info.Title) info.title = String(data.info.Title);
    if (data.info.Author) info.author = String(data.info.Author);
    if (data.info.Creator) info.creator = String(data.info.Creator);
  }

  return {
    text: data.text || '',
    pageCount: data.numpages || 0,
    info,
  };
}

/**
 * Fallback extraction: directly uses pdfjs-dist to parse pages
 * one-by-one with per-page error isolation. More tolerant of
 * malformed PDF command streams.
 */
async function fallbackExtraction(buffer: Buffer): Promise<PdfExtractionResult> {
  console.log('[pdf] Attempting fallback extraction with per-page isolation...');

  // Load the same bundled pdfjs that pdf-parse uses
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFJS = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');
  PDFJS.disableWorker = true;

  let doc;
  try {
    doc = await PDFJS.getDocument(buffer);
  } catch (docErr: unknown) {
    // If getDocument itself fails, try with a Uint8Array copy
    // Some pdfjs versions handle typed arrays differently
    console.log('[pdf] getDocument failed, retrying with Uint8Array...');
    const uint8 = new Uint8Array(buffer);
    doc = await PDFJS.getDocument(uint8);
  }

  const numPages = doc.numPages;
  console.log('[pdf] Fallback: opened document with', numPages, 'pages');

  let fullText = '';
  let successPages = 0;
  const info: Record<string, string> = {};

  // Extract metadata (non-critical)
  try {
    const metaData = await doc.getMetadata();
    if (metaData?.info) {
      if (metaData.info.Title) info.title = String(metaData.info.Title);
      if (metaData.info.Author) info.author = String(metaData.info.Author);
      if (metaData.info.Creator) info.creator = String(metaData.info.Creator);
    }
  } catch {
    // Metadata extraction is non-critical
  }

  // Extract text page-by-page with per-page error isolation
  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await doc.getPage(i);
      const content = await page.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      });

      let pageText = '';
      let lastY: number | undefined;

      for (const item of content.items) {
        if (lastY === item.transform[5] || lastY === undefined) {
          pageText += item.str;
        } else {
          pageText += '\n' + item.str;
        }
        lastY = item.transform[5];
      }

      fullText += '\n\n' + pageText;
      successPages++;
    } catch (pageErr: unknown) {
      const msg = pageErr instanceof Error ? pageErr.message : String(pageErr);
      console.warn(`[pdf] Fallback: page ${i}/${numPages} failed: ${msg}`);
      // Continue to next page — don't abort the entire extraction
    }
  }

  doc.destroy();
  console.log('[pdf] Fallback extraction complete — extracted', successPages, '/', numPages, 'pages, text length:', fullText.length);

  return {
    text: fullText,
    pageCount: numPages,
    info,
  };
}

/**
 * Main entry point for PDF text extraction.
 * Tries the primary path first, falls back to per-page isolation
 * if the parser encounters internal errors.
 */
export async function extractTextFromPdf(
  buffer: Buffer
): Promise<PdfExtractionResult> {
  console.log('[pdf] Starting extraction, buffer length:', buffer.length);

  if (!buffer || buffer.length === 0) {
    throw new Error('Empty buffer — no data to parse.');
  }

  let result: PdfExtractionResult;

  try {
    result = await primaryExtraction(buffer);
  } catch (primaryErr: unknown) {
    const msg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    console.warn('[pdf] Primary extraction failed:', msg);

    // Check for fatal, non-recoverable errors first
    if (msg.includes('password')) {
      throw new Error('This PDF is password-protected and cannot be parsed.');
    }
    if (msg.includes('Invalid PDF') || msg.includes('Bad')) {
      throw new Error('Invalid PDF file. The file may be corrupted.');
    }

    // For parser-level errors (token overflow, malformed commands, etc.),
    // attempt the per-page fallback extraction
    console.log('[pdf] Attempting fallback extraction for parser error...');
    try {
      result = await fallbackExtraction(buffer);
    } catch (fallbackErr: unknown) {
      const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      console.error('[pdf] Fallback extraction also failed:', fbMsg);
      throw new Error(
        `PDF extraction failed after all attempts. Primary: ${msg}. Fallback: ${fbMsg}`
      );
    }
  }

  // Post-processing (shared by both paths)
  let text = result.text;

  // Collapse excessive whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  // Truncate to stay within LLM token limits
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH) + '\n\n[...truncated]';
  }

  if (text.length < 20) {
    throw new Error(
      'Could not extract meaningful text from this PDF. It may be scanned or image-based.'
    );
  }

  console.log('[pdf] Extraction success — final text length:', text.length, ', pages:', result.pageCount);

  return {
    text,
    pageCount: result.pageCount,
    info: result.info,
  };
}
