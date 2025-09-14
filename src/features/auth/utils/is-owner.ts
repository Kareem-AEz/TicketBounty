export const isOwner = (authUserId: string, entityUserId: string) => {
  return authUserId === entityUserId;
};
