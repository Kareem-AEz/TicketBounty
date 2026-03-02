import { getAuth } from "@/features/auth/queries/get-auth";
import { isOwner } from "@/features/auth/utils/is-owner";
import { getMyActiveOrganization } from "@/features/organizations/queries/get-my-active-organization";
import prisma from "@/lib/prisma";
import { TICKET_PAGE_SIZE } from "../constants";
import { TicketParsedSearchParams } from "../utils/search-params";
import { getTicketPermission } from "./get-ticket-permission";

export const getTickets = async (
  userId?: string,
  showOrganizationTickets = false,
  searchParams?: TicketParsedSearchParams,
) => {
  const activeOrganization = await getMyActiveOrganization();
  const { user } = await getAuth();

  const where = {
    ...(!showOrganizationTickets && { userId }),
    ...(showOrganizationTickets &&
      activeOrganization && {
        organizationId: activeOrganization.id,
      }),
    ...(searchParams?.query && {
      OR: [
        {
          title: {
            contains: searchParams.query,
            mode: "insensitive" as const,
          },
        },
        {
          content: {
            contains: searchParams.query,
            mode: "insensitive" as const,
          },
        },
        {
          user: {
            username: {
              contains: searchParams.query,
              mode: "insensitive" as const,
            },
          },
        },
      ],
    }),
  };

  const isValidSize =
    searchParams && TICKET_PAGE_SIZE.includes(searchParams.size);

  if (!isValidSize) {
    return {
      data: [],
      metadata: { total: 0, hasNextPage: false },
    };
  }

  const take = searchParams && Number(searchParams.size);
  const skip = searchParams && searchParams.page * (take ?? 0);

  const [tickets, total] = await prisma.$transaction([
    prisma.ticket.findMany({
      skip,
      take,
      where,
      orderBy: searchParams
        ? { [searchParams.sortKey]: searchParams.sortOrder }
        : { createdAt: "desc" },

      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  const permissions = await Promise.all(
    tickets.map((t) =>
      getTicketPermission({
        organizationId: t.organizationId ?? "",
        userId: t.userId ?? "",
      }),
    ),
  );

  return {
    data: tickets.map((t, index) => {
      return {
        ...t,
        permissions: {
          canDeleteTickets:
            (isOwner(user?.id ?? "", t.userId ?? undefined) &&
              permissions[index]?.canDeleteTickets) ??
            false,
        },
      };
    }),
    metadata: { total, hasNextPage: total > (skip ?? 0) + (take ?? 0) },
  };
};
