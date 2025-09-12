"use client";

import { Ticket } from "@prisma/client";
import { usePathname } from "next/navigation";
import React, { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import Form from "@/components/form/form";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copy } from "@/lib/copy";
import { fromCent } from "@/lib/currency";
import { ticketPath } from "@/paths";
import { upsertTicket } from "../actions/upsert-ticket";

type TicketUpsertFormProps = {
  ticket?: Ticket;
  onClose?: () => void;
};

function TicketUpsertForm({ ticket, onClose }: TicketUpsertFormProps) {
  const pathname = usePathname();

  const isDetail = pathname.includes(`${ticketPath(ticket?.id ?? "")}`);

  const [actionState, formAction] = useActionState(
    upsertTicket.bind(null, ticket?.id),
    EMPTY_ACTION_STATE,
  );

  return (
    <Form
      action={formAction}
      actionState={actionState}
      isDetail={isDetail}
      onClose={onClose}
    >
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

      <div className="mb-3 flex gap-x-3">
        {/* deadline */}
        <div className="flex w-full flex-col gap-y-3">
          <Label htmlFor={`deadline-${ticket?.id}`}>Deadline</Label>
          <DatePicker
            key={actionState.timestamp}
            id={`deadline-${ticket?.id}`}
            name="deadline"
            defaultValue={
              (actionState?.payload?.get("deadline") as string) ??
              ticket?.deadline
            }
          />
          <FieldError actionState={actionState} name="deadline" />
        </div>

        {/* bounty */}
        <div className="flex w-full flex-col gap-y-3">
          <Label htmlFor={`bounty-${ticket?.id}`}>Bounty ($)</Label>
          <Input
            id={`bounty-${ticket?.id}`}
            name="bounty"
            type="number"
            step="0.1"
            placeholder={copy.forms.bounty}
            defaultValue={
              (actionState?.payload?.get("bounty") as string) ??
              fromCent(ticket?.bounty ?? 0)
            }
          />
          <FieldError actionState={actionState} name="bounty" />
        </div>
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
    </Form>
  );
}

export default TicketUpsertForm;
