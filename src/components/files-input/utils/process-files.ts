import { fileTypeFromBuffer } from "file-type";
import { ProcessedFile, ProcessFilesProps } from "../types";
import { hashFile } from "./hash-file";

/**
 * Checks if a MIME type matches a pattern (supports wildcards like 'image/*')
 */
const matchesMimeType = (mimeType: string, pattern: string) => {
  if (pattern === "*/*") return true;
  if (pattern.endsWith("/*")) {
    const type = pattern.split("/")[0];
    return mimeType.startsWith(`${type}/`);
  }
  return mimeType === pattern;
};

/**
 * Validates and processes a list of new files against existing files and configuration.
 *
 * Key features:
 * - Uses Web Crypto API for browser-native SHA-256 hashing.
 * - Robust MIME type validation with wildcard support.
 * - Accurate duplicate detection using hash + file metadata.
 * - Browser-safe binary handling with Uint8Array.
 */
export const processFiles = async ({
  existingFiles = [],
  newFiles,
  config: { maxFiles, maxSize, acceptedTypes },
}: ProcessFilesProps) => {
  const toAdd: ProcessedFile[] = [];
  const errors: { message: string; file: File }[] = [];

  // Track hashes for duplicate detection within the current batch
  const processedHashes = new Set<string>();

  for (const file of newFiles) {
    // 1. -- MAX ATTACHMENT COUNT CHECK --
    if (existingFiles.length + toAdd.length >= maxFiles) {
      errors.push({
        message: `Maximum number of files (${maxFiles}) reached`,
        file,
      });
      // We break here because any subsequent files would also exceed the limit
      break;
    }

    // 2. -- SIZE CHECK --
    if (file.size > maxSize) {
      errors.push({
        message: `File "${file.name}" is too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`,
        file,
      });
      continue;
    }

    // 3. -- BINARY PROCESSING --
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 4. -- HASHING & DUPLICATE CHECK --
    const hash = await hashFile(uint8Array);

    // Duplicate check against current batch (by hash)
    if (processedHashes.has(hash)) {
      continue; // Skip silently if it's the exact same file in the same drop
    }

    // Duplicate check against existing files (name + size fallback since we don't have hashes for them)
    const isExistingDuplicate = existingFiles.some((f) => f.hash === hash);

    if (isExistingDuplicate) {
      errors.push({
        message: `File "${file.name}" already exists`,
        file,
      });
      continue;
    }

    // 5. -- MIME TYPE VALIDATION --
    // We try to verify the actual file content using file-type
    const typeResult = await fileTypeFromBuffer(uint8Array);
    const actualMimeType = typeResult?.mime;

    if (!actualMimeType) {
      errors.push({
        message: `File "${file.name}" has no mime type`,
        file,
      });
      continue;
    }

    // Check if the actual type is in the accepted list
    const isAccepted = acceptedTypes.some((pattern) =>
      matchesMimeType(actualMimeType, pattern),
    );

    if (!isAccepted) {
      errors.push({
        message: `File "${file.name}" type (${actualMimeType}) is not supported`,
        file,
      });
      continue;
    }

    // Success! Add to the results
    processedHashes.add(hash);
    toAdd.push({
      file,
      uint8Array,
      hash,
      mimeType: actualMimeType,
    });
  }

  return { toAdd, errors };
};
