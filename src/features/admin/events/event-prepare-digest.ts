import { eventType } from "inngest";
import { z } from "zod/v4";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";

export type AdminDigestReadyEventData = {
  totalTickets: {
    total: number;
    totalSince: number;
  };
  totalUsers: {
    total: number;
    totalSince: number;
  };
  totalComments: {
    total: number;
    totalSince: number;
  };
};

export const adminDigestReadyEvent = eventType("app/admin-digest.ready", {
  schema: z.object({
    totalTickets: z.object({
      total: z.number(),
      totalSince: z.number(),
    }),
    totalUsers: z.object({
      total: z.number(),
      totalSince: z.number(),
    }),
    totalComments: z.object({
      total: z.number(),
      totalSince: z.number(),
    }),
  }),
});

export const eventPrepareAdminDigest = inngest.createFunction(
  {
    id: "prepare-admin-digest",
    triggers: [{ cron: "0 0 * * *" }], // every day at midnight
  },
  async ({ step }) => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const totalTicketsPromise = step.run("count-tickets", async () => {
      const total = await prisma.ticket.count();
      const totalSince = await prisma.ticket.count({
        where: {
          createdAt: {
            gte: since,
          },
        },
      });

      return {
        total,
        totalSince,
      };
    });
    const totalUsersPromise = step.run("count-users", async () => {
      const total = await prisma.user.count();
      const totalSince = await prisma.user.count({
        where: {
          createdAt: {
            gte: since,
          },
        },
      });
      return {
        total,
        totalSince,
      };
    });
    const totalCommentsPromise = step.run("count-comments", async () => {
      const total = await prisma.ticketComment.count();
      const totalSince = await prisma.ticketComment.count({
        where: {
          createdAt: {
            gte: since,
          },
        },
      });
      return {
        total,
        totalSince,
      };
    });

    const [totalTickets, totalUsers, totalComments] = await Promise.all([
      totalTicketsPromise,
      totalUsersPromise,
      totalCommentsPromise,
    ]);

    await step.sendEvent(
      "emit-admin-digest-ready",
      adminDigestReadyEvent.create({
        totalTickets,
        totalUsers,
        totalComments,
      }),
    );
  },
);
