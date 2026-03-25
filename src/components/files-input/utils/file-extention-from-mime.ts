// -- THE MIME→EXTENSION BRIDGE --
// This utility converts a **MIME type** (e.g. "image/jpeg") into a common file extension (e.g. ".jpg").
// --
// Note: This does NOT guarantee the *canonical* extension for every MIME type.
// Some MIME types map to multiple extensions ("image/jpeg" → ".jpg", ".jpeg").
// If you need absolute correctness (for downloads, etc.), consider using a well-maintained map or a library like "mime-types".

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg", // Most browsers expect ".jpg"
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "application/zip": ".zip",
  "application/json": ".json",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  // You can expand this as needed.
};

/**
 * Returns the most common file extension for a MIME type.
 * If unknown, falls back to using the substring after the '/' (e.g. "octet-stream" → ".octet-stream").
 */
export function fileExtentionFromMime(mime: string): string {
  // -- STANDARD LOOKUP --
  const mapped = MIME_EXTENSION_MAP[mime];
  if (mapped) return mapped;

  // -- FALLBACK: SYNTHETIC EXTENSION --
  // Use the bit after the "/" so unknown types still return a plausible extension.
  const parts = mime.split("/");
  if (parts.length !== 2 || !parts[1]) return "";
  // Clean up things like "svg+xml" to give ".svg"
  const sub = parts[1].split("+")[0];
  return `.${sub}`;
}
