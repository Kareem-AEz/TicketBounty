/**
 * Hashes a Uint8Array using SHA-256 using the browser's native Crypto API.
 * @param data - The data to hash as a Uint8Array.
 * @returns The SHA-256 hash as a hex string.
 */
export const hashFile = async (data: Uint8Array) => {
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data.buffer as ArrayBuffer,
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};
