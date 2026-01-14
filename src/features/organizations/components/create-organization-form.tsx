"use client";
import { redirect } from "next/navigation";
import React, { useActionState } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/form/field-error";
import Form from "@/components/form/form";
import { useActionFeedback } from "@/components/form/hooks/useActionFeedback";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { ticketsPath } from "@/paths";
import { createOrganization } from "../actions/create-organization";

export default function CreateOrganizationForm({
  redirectTo,
}: {
  redirectTo?: string;
}) {
  const [actionState, action] = useActionState(
    createOrganization,
    EMPTY_ACTION_STATE,
  );

  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message) toast.success(actionState.message);
      redirect(redirectTo ?? ticketsPath());
    },
    onError: ({ actionState }) => {
      if (actionState.message) toast.error(actionState.message);
    },
  });

  return (
    <Form action={action} actionState={actionState}>
      <div className="flex flex-col gap-y-1">
        <Input
          name="name"
          placeholder="Organization Name"
          defaultValue={(actionState.payload?.get("name") as string) ?? ""}
        />
        <FieldError actionState={actionState} name="name" />
      </div>

      <SubmitButton>Create Organization</SubmitButton>
    </Form>
  );
}
