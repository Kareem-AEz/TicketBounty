import { Prisma, PrismaClient } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TRANSITION_CONFIG } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStaggeredDelay({
  index,
  delay = TRANSITION_CONFIG.baseDelay,
}: {
  index: number;
  delay?: number;
}) {
  return {
    transitionDelay: `${index * delay}ms`,
  };
}

const prisma = new PrismaClient();

export const getTableSize = async (table: string) => {
  // Use Prisma.raw() to correctly handle the table identifier.
  const rawQuery = Prisma.raw(
    `SELECT pg_size_pretty(pg_total_relation_size('"${table}"'))`,
  );

  const size = await prisma.$queryRaw(rawQuery);

  return size;
};

// getTableSize("Ticket").then(console.log);
