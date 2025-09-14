import { notFound } from "next/navigation";
import React from "react";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import TicketItem from "@/features/ticket/components/ticket-item";
import { getTicket } from "@/features/ticket/queries/get-ticket";

type TicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

async function page({ params }: TicketPageProps) {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);
  const user = await getAuthOrRedirect();

  if (!ticket) {
    notFound();
  }

  return <TicketItem ticket={ticket} isDetail user={user} />;
}

export default page;
 