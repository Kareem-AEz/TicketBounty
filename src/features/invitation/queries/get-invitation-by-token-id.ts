import prisma from "@/lib/prisma";
import { hashToken } from "@/utils/crypto";

export const getInvitationByTokenId = async (tokenId: string) => {
  const tokenHash = hashToken(tokenId);
  const invitation = await prisma.invitations.findUnique({
    where: { tokenHash },
  });
  return invitation;
};
