import { LucideSearchX } from "lucide-react";
import Link from "next/link";
import Placeholder from "@/components/placeholder";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { ticketsPath } from "@/paths";

export default function NotFound() {
  return (
    <Placeholder
      icon={<LucideSearchX className="text-muted-foreground size-16" />}
      label={copy.tickets.notFound}
      button={
        <Button asChild variant="outline">
          <Link href={ticketsPath()}>{copy.actions.backToTickets}</Link>
        </Button>
      }
    />
  );
}
