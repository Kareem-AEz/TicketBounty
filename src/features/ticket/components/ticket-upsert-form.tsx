import { Ticket } from "@prisma/client";
import React from "react";
import SubmitButton from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copy } from "@/lib/copy";
import { upsertTicket } from "../actions/upsert-ticket";

type TicketUpsertFormProps = {
  ticket?: Ticket;
  onClose?: () => void;
};

function TicketUpsertForm({ ticket, onClose }: TicketUpsertFormProps) {
  return (
    <form action={upsertTicket} className="flex flex-col gap-y-5">
      <input type="hidden" name="id" value={ticket?.id} />
      <div className="flex flex-col gap-y-3">
        <Label htmlFor={`title-${ticket?.id}`}>Title</Label>
        <Input
          id={`title-${ticket?.id}`}
          name="title"
          placeholder={copy.forms.title}
          defaultValue={ticket?.title}
        />
      </div>

      <div className="flex flex-col gap-y-3">
        <Label htmlFor={`content-${ticket?.id}`}>Content</Label>
        <Textarea
          id={`content-${ticket?.id}`}
          name="content"
          placeholder={copy.forms.content}
          className="resize-none"
          defaultValue={ticket?.content}
        />
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
        <SubmitButton
          className="flex flex-1 items-center justify-center"
          pendingLabel={copy.actions.saving}
          onSubmit={onClose}
        >
          {copy.actions.save}
        </SubmitButton>
      </div>
    </form>
  );
}

export default TicketUpsertForm;
