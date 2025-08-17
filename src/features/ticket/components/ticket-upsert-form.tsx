"use client";

import { Ticket } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useActionState } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/form/field-error";
import { useActionFeedback } from "@/components/form/hooks/useActionFeedback";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copy } from "@/lib/copy";
import { ticketPath } from "@/paths";
import { upsertTicket } from "../actions/upsert-ticket";

type TicketUpsertFormProps = {
  ticket?: Ticket;
  onClose?: () => void;
};

function TicketUpsertForm({ ticket, onClose }: TicketUpsertFormProps) {
  const router = useRouter();

  const [actionState, formAction] = useActionState(
    upsertTicket.bind(null, ticket?.id),
    EMPTY_ACTION_STATE,
  );

  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message && actionState.ticketId)
        toast.success(actionState.message, {
          action: {
            label: "View",
            onClick: () => {
              router.push(ticketPath(actionState.ticketId!));
            },
          },
        });
      onClose?.();
    },
    onError: ({ actionState }) => {
      if (actionState.message) toast.error(actionState.message);
    },
  });

  return (
    <form action={formAction} className="flex flex-col gap-y-5">
      <input type="hidden" name="id" value={ticket?.id} />
      <div className="flex flex-col gap-y-3">
        <Label htmlFor={`title-${ticket?.id}`}>Title</Label>
        <Input
          id={`title-${ticket?.id}`}
          name="title"
          placeholder={copy.forms.title}
          defaultValue={
            (actionState?.payload?.get("title") as string) ?? ticket?.title
          }
        />
        <FieldError actionState={actionState} name="title" />
      </div>

      <div className="flex flex-col gap-y-3">
        <Label htmlFor={`content-${ticket?.id}`}>Content</Label>
        <Textarea
          id={`content-${ticket?.id}`}
          name="content"
          placeholder={copy.forms.content}
          className="resize-none"
          defaultValue={
            (actionState?.payload?.get("content") as string) ?? ticket?.content
          }
        />
        <FieldError actionState={actionState} name="content" />
      </div>

      <div className="flex gap-x-2">
        {ticket && (
          <Button
            className="flex-1"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {copy.actions.cancel}
          </Button>
        )}

        <div className="flex flex-1 flex-col gap-y-2">
          <SubmitButton
            className="flex flex-1 items-center justify-center"
            pendingLabel={copy.actions.saving}
          >
            {copy.actions.save}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

export default TicketUpsertForm;
