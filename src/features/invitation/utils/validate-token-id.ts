export const validateTokenId = (tokenId: string) => {
  if (!tokenId) {
    throw new Error("Token ID is required");
  }
  if (tokenId.length !== 32) {
    throw new Error("Token ID must be 32 characters long");
  }
};
