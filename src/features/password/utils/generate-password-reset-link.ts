import { generateRandomToken, hashToken } from "@/lib/generate-random-token";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/url";
import { passwordResetPath } from "@/paths";

const PASSWORD_RESET_TOKEN_EXPIRATION_TIME_MS = 10 * 60 * 1000; // 10 minutes

export const generatePasswordResetLink = async (userId: string) => {
  const tokenId = generateRandomToken();
  const tokenHash = hashToken(tokenId);

  prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: {
        userId,
      },
    });

    await tx.passwordResetToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt: new Date(
          Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION_TIME_MS,
        ),
      },
    });
  });

  const passwordResetLink = getBaseUrl() + passwordResetPath(tokenId);

  return passwordResetLink;
};
