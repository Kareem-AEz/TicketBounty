export const isOwner = (
  authUserId: string | undefined,
  entityUserId: string | undefined,
) => {
  return authUserId === entityUserId;
};
