import { Ticket } from "@/generated/client";
import { LucideTrash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { deleteTicket } from "../actions/delete-ticket";
import DetailButton from "./detail-button";

type TicketActionButtonsProps = {
  ticket: Ticket;
  isDetail?: boolean;
};

function TicketDeleteButton({
  ticket,
  isDetail = false,
}: TicketActionButtonsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    const result = await deleteTicket({ id: ticket.id, isDetail });

    if (result.status === "SUCCESS" && result.message) {
      toast.success(result.message);
    }
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <DetailButton
          index={2}
          icon={<LucideTrash2 />}
          label={copy.actions.delete}
          animate={!isDetail}
        />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.actions.delete}</AlertDialogTitle>
          <AlertDialogDescription>{copy.confirm.delete}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            type="submit"
            onClick={handleDelete}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default TicketDeleteButton;
