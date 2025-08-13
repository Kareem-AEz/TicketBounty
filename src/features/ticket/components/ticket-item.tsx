import { LucidePencil, LucideSquareArrowOutUpRight } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { ticketPath } from "@/paths";
import { TICKET_ICONS } from "../constants";
import { Ticket } from "../types";
import DetailButton from "./detail-button";

type TicketItemProps = {
  ticket: Ticket;
  isDetail?: boolean;
};

function TicketItem({ ticket, isDetail }: TicketItemProps) {
  return (
    <div className="group/card flex justify-center gap-x-1">
      <Card className={cn("w-full max-w-md", isDetail && "max-w-xl")}>
        <CardHeader>
          <CardTitle
            className={cn(
              "flex min-w-0 items-center gap-x-2",
              isDetail && "items-start",
            )}
          >
            <span className={cn(isDetail && "mt-1")}>
              {TICKET_ICONS[ticket.status]}
            </span>
            <h3
              className={cn("text-xl font-semibold", !isDetail && "truncate")}
            >
              {ticket.title}
            </h3>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <span
            className={cn(
              "text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap",
              ticket.status === "DONE" && "line-through",
              isDetail && "line-clamp-none",
            )}
          >
            {ticket.content}
          </span>
        </CardContent>
      </Card>

      {!isDetail && (
        <div className="group/buttons flex flex-col gap-y-2 overflow-hidden mask-l-from-70% mask-l-to-100% p-1">
          <DetailButton
            index={0}
            icon={<LucideSquareArrowOutUpRight />}
            href={ticketPath(ticket.id)}
            label={copy.actions.view}
          />
          <DetailButton
            index={1}
            icon={<LucidePencil />}
            href={""}
            label={copy.actions.edit}
          />
        </div>
      )}
    </div>
  );
}

export default TicketItem;
