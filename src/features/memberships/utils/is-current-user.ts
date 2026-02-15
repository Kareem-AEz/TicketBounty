import { getAuth } from "@/features/auth/queries/get-auth";

/**
 * Checks if the current user is the same as the member
 * @param memberId - The id of the member to check
 * @returns True if the current user is the same as the member, false otherwise
 */
export const isCurrentUser = async (memberId: string) => {
  const { user } = await getAuth();
  if (!user) return false;
  return user.id === memberId;
};
