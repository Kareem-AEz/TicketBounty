import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    transactionOptions: {
      maxWait: 10000,
      timeout: 10000,
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
