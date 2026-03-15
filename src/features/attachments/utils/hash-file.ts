import { createHash } from "crypto";

export const hashFile = async (buffer: Buffer) => {
  const hash = createHash("sha256").update(buffer).digest("hex");
  return hash;
};
