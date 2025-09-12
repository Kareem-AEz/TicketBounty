"use client";

import { Ticket, TicketStatus } from "@prisma/client";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateStatus } from "../actions/update-status";
import { TICKET_STATUS_LABELS } from "../constants";

type TicketDropdownMenuProps = {
  ticket: Ticket;
  trigger: React.ReactNode;
};

export default function TicketDropdownMenu({
  ticket,
  trigger,
}: TicketDropdownMenuProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (status: string) => {
    setIsLoading(true);
    try {
      if (status === ticket.status) return;
      const result = await updateStatus(ticket.id, status as TicketStatus);
      if (result.status === "SUCCESS") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isLoading}>
          {trigger}
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={ticket.status}
            onValueChange={handleStatusChange}
          >
            {Object.entries(TICKET_STATUS_LABELS).map(([key, value]) => (
              <DropdownMenuRadioItem key={key} value={key}>
                {value}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
