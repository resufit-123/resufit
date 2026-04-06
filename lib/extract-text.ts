// Text extraction from PDF and DOCX files.
// Runs server-side only — never import in Client Components.
// Uses pdf-parse and mammoth — no API calls, zero AI cost.

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ACCEPTED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

export interface ExtractionResult {
  text: string;
  mimeType: string;
  fileName: string;
}

export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_TYPE"
      | "TOO_LARGE"
      | "ENCRYPTED"
      | "EMPTY"
      | "PARSE_FAILED"
  ) {
    super(message);
    this.name = "ExtractionError";
  }
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  // 1. Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ExtractionError(
      "File is too large. Maximum size is 5MB.",
      "TOO_LARGE"
    );
  }

  // 2. Validate MIME type (from browser) and extension (belt-and-suspenders)
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ACCEPTED_MIME_TYPES.has(file.type) && !ACCEPTED_EXTENSIONS.has(ext)) {
    throw new ExtractionError(
      "Please upload a PDF, DOC, or DOCX file.",
      "INVALID_TYPE"
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // 3. Route to the correct parser
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  let text: string;

  if (isPdf) {
    text = await extractFromPdf(buffer);
  } else {
    text = await extractFromDocx(buffer);
  }

  // 4. Sanity check — extracted text must be meaningful
  const trimmed = text.trim();
  if (trimmed.length < 100) {
    throw new ExtractionError(
      "This file appears to be empty or scanned/image-based. Please upload a text-based PDF or Word document.",
      "EMPTY"
    );
  }

  return {
    text: trimmed,
    mimeType: file.type,
    fileName: file.name,
  };
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import keeps this out of the client bundle
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);

    if (!result.text || result.text.trim().length === 0) {
      throw new ExtractionError(
        "This PDF appears to be scanned or image-based. Please upload a text-based PDF.",
        "EMPTY"
      );
    }

    return result.text;
  } catch (err) {
    if (err instanceof ExtractionError) throw err;

    // pdf-parse throws on encrypted PDFs
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("encrypt") || message.toLowerCase().includes("password")) {
      throw new ExtractionError(
        "This PDF is password-protected. Please remove the password and try again.",
        "ENCRYPTED"
      );
    }

    throw new ExtractionError("Failed to read this PDF. Please try a different file.", "PARSE_FAILED");
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch {
    throw new ExtractionError(
      "Failed to read this Word document. Please try saving it as PDF and uploading again.",
      "PARSE_FAILED"
    );
  }
}
