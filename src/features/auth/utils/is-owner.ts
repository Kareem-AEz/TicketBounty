export const isOwner = (
  authUserId: string | undefined,
  entityUserId: string | undefined,
) => {
  if (!authUserId || !entityUserId) {
    return false;
  }
  return authUserId === entityUserId;
};
