import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import Comments from "@/features/comment/components/comments";
import TicketItem from "@/features/ticket/components/ticket-item";
import { getTicket } from "@/features/ticket/queries/get-ticket";
import { homePath, ticketsPath } from "@/paths";

type TicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

const breadcrumbs: Breadcrumb[] = [
  {
    label: "All Tickets",
    href: homePath(),
  },
  {
    label: "My Tickets",
    href: ticketsPath(),
  },
];

export async function generateMetadata({
  params,
}: TicketPageProps): Promise<Metadata> {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);

  if (!ticket) {
    return {
      title: "Ticket Not Found",
    };
  }

  return {
    title: ticket.title,
  };
}

async function page({ params }: TicketPageProps) {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);
  const user = await getAuthOrRedirect();

  if (!ticket) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-y-8">
      <Breadcrumbs breadcrumbs={[...breadcrumbs, { label: ticket.title }]} />
      <Separator className="mb-8" />
      <TicketItem ticket={ticket} isDetail user={user} />
      <Comments ticketId={ticketId} />
    </div>
  );
}

export default page;
