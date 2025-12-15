// Static enum values for use in client components
// These are duplicated from Prisma to avoid importing @prisma/client in the browser

export const TicketScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  title: "title",
  content: "content",
  status: "status",
  userId: "userId",
  deadline: "deadline",
  bounty: "bounty",
} as const;

export type TicketScalarFieldEnum =
  (typeof TicketScalarFieldEnum)[keyof typeof TicketScalarFieldEnum];

export const SortOrder = {
  asc: "asc",
  desc: "desc",
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
