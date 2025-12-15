import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";

export type AdminDigestReadyEventData = {
  data: {
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
};

export const eventPrepareAdminDigest = inngest.createFunction(
  {
    id: "prepare-admin-digest",
  },
  { cron: "0 0 * * *" }, // every day at midnight
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

    await step.sendEvent("emit-admin-digest-ready", {
      name: "app/admin.digest-ready",
      data: {
        totalTickets,
        totalUsers,
        totalComments,
      },
    });
  },
);
