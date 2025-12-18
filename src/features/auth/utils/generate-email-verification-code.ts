import prisma from "@/lib/prisma";
import { generateRandomCode } from "@/utils/crypto";

export const generateEmailVerificationCode = async (
  userId: string,
  email: string,
) => {
  const code = generateRandomCode();

  prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.deleteMany({
      where: {
        userId,
      },
    });

    await tx.emailVerificationToken.create({
      data: {
        code,
        email,
        userId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
  });

  return code;
};
