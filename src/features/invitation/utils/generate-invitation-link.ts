import { addDays } from "date-fns";
import type { Prisma } from "@/generated/client";
import { getBaseUrl } from "@/lib/url";
import { invitationPath } from "@/paths";
import { generateRandomToken, hashToken } from "@/utils/crypto";
import { INVITATION_EXPIRATION_TIME_DAYS } from "../constants";

/**
 * Generates a unique invitation link for a user to join an organization.
 * @param tx - Prisma transaction client (for use inside prisma.$transaction).
 * @param organizationId - The ID of the organization to join.
 * @param email - The email of the user to invite.
 * @param invitedByUserId - The ID of the user who is inviting the user.
 * @returns The invitation link.
 */
type GenerateInvitationLinkParams = {
  tx: Prisma.TransactionClient;
  organizationId: string;
  email: string;
  invitedByUserId: string;
};
export const generateInvitationLink = async ({
  tx,
  organizationId,
  email,
  invitedByUserId,
}: GenerateInvitationLinkParams) => {
  await tx.invitations.deleteMany({
    where: {
      email,
      organizationId,
    },
  });
  const token = generateRandomToken();
  const tokenHash = hashToken(token);

  await tx.invitations.create({
    data: {
      email,
      organizationId,
      invitedByUserId,
      tokenHash,
      expiresAt: addDays(new Date(), INVITATION_EXPIRATION_TIME_DAYS),
    },
  });

  const invitationLink = getBaseUrl() + invitationPath(token);

  return invitationLink;
};
