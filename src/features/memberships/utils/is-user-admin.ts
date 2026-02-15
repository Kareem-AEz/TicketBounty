import { getAuth } from "@/features/auth/queries/get-auth";
import { Prisma, PrismaClient } from "@/generated/client";
import { MembershipRole } from "@/generated/enums";
import prisma from "@/lib/prisma";
import { getMembership } from "../queries/get-membership";

type IsUserAdminParams = {
  memberId?: string | null;
  organizationId: string;
  tx?: PrismaClient | Prisma.TransactionClient;
};

/**
 * Checks if the user is an admin of the organization
 * @param memberId - The id of the member to check, if not provided, the current user will be checked
 * @param organizationId - The id of the organization to check
 * @param tx - The transaction client to use, if not provided, the default prisma client will be used
 * @returns True if the user is an admin, false otherwise
 */
export const isUserAdmin = async ({
  memberId = null,
  organizationId,
  tx = prisma,
}: IsUserAdminParams) => {
  if (!memberId) {
    const { user } = await getAuth();
    if (!user) return false;
    const membership = await getMembership(organizationId, user.id, { tx });
    return membership?.membershipRole === MembershipRole.ADMIN;
  }

  const membership = await getMembership(organizationId, memberId, { tx });
  return membership?.membershipRole === MembershipRole.ADMIN;
};
