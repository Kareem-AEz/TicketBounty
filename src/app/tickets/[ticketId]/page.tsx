import { notFound } from "next/navigation";
import React from "react";
import type { Metadata } from "next";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import TicketItem from "@/features/ticket/components/ticket-item";
import { getTicket } from "@/features/ticket/queries/get-ticket";

type TicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

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

  return <TicketItem ticket={ticket} isDetail user={user} />;
}

export default page;
