/**
 * CogLens — PDF Text Extraction
 *
 * Uses pdf-parse v1.x for reliable text extraction.
 * Imports from lib/pdf-parse.js directly to avoid the index.js
 * test-file-loading bug (it tries to read a test PDF on import).
 */

const MAX_TEXT_LENGTH = 100_000;

interface PdfExtractionResult {
  text: string;
  pageCount: number;
  info: Record<string, string>;
}

export async function extractTextFromPdf(
  buffer: Buffer
): Promise<PdfExtractionResult> {
  console.log('[pdf] Starting extraction, buffer length:', buffer.length);

  if (!buffer || buffer.length === 0) {
    throw new Error('Empty buffer — no data to parse.');
  }

  // Import the library directly, bypassing index.js which has a
  // debug-mode bug that tries to readFileSync a test PDF.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse/lib/pdf-parse.js');

  let data;
  try {
    data = await pdfParse(buffer);
  } catch (parseErr: unknown) {
    const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    console.error('[pdf] Parser error:', msg);

    if (msg.includes('password')) {
      throw new Error('This PDF is password-protected and cannot be parsed.');
    }
    if (msg.includes('Invalid PDF') || msg.includes('Bad')) {
      throw new Error('Invalid PDF file. The file may be corrupted.');
    }
    throw new Error(`PDF parser failed: ${msg}`);
  }

  console.log('[pdf] Parse complete — pages:', data.numpages, 'text length:', data.text?.length);

  let text: string = data.text || '';

  // Collapse excessive whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  // Truncate to stay within Gemini token limits
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH) + '\n\n[...truncated]';
  }

  if (text.length < 20) {
    throw new Error(
      'Could not extract meaningful text from this PDF. It may be scanned or image-based.'
    );
  }

  const info: Record<string, string> = {};
  if (data.info) {
    if (data.info.Title) info.title = String(data.info.Title);
    if (data.info.Author) info.author = String(data.info.Author);
    if (data.info.Creator) info.creator = String(data.info.Creator);
  }

  console.log('[pdf] Extraction success — final text length:', text.length);

  return {
    text,
    pageCount: data.numpages || 0,
    info,
  };
}
