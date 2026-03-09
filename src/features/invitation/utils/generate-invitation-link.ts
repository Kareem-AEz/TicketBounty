import { addDays } from "date-fns";
import prisma from "@/lib/prisma";
import { getBaseUrl } from "@/lib/url";
import { invitationPath } from "@/paths";
import { generateRandomToken, hashToken } from "@/utils/crypto";
import { INVITATION_EXPIRATION_TIME_DAYS } from "../constants";

/**
 * Generates a unique invitation link for a user to join an organization.
 * @param organizationId - The ID of the organization to join.
 * @param email - The email of the user to invite.
 * @param invitedByUserId - The ID of the user who is inviting the user.
 * @returns The invitation link.
 */
type GenerateInvitationLinkParams = {
  organizationId: string;
  email: string;
  invitedByUserId: string;
};
export const generateInvitationLink = async ({
  organizationId,
  email,
  invitedByUserId,
}: GenerateInvitationLinkParams) => {
  await prisma.invitations.deleteMany({
    where: {
      email,
      organizationId,
    },
  });
  const token = generateRandomToken();
  const tokenHash = hashToken(token);

  await prisma.invitations.create({
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
