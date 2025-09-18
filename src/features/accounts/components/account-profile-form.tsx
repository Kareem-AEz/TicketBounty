"use client";

import React, { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import Form from "@/components/form/form";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { updateUsername } from "../actions/update-username";

export default function AccountProfileForm() {
  const { user } = useAuth();
  const [actionState, action] = useActionState(
    updateUsername,
    EMPTY_ACTION_STATE,
  );

  return (
    <Form action={action} actionState={actionState}>
      <input type="hidden" name="id" value={user?.id ?? ""} />
      <div className="flex flex-col gap-y-1">
        <Input
          name="username"
          placeholder="Username"
          defaultValue={
            (actionState.payload?.get("username") as string) ?? user?.username
          }
        />
        <FieldError actionState={actionState} name="username" />
      </div>

      <div className="flex flex-col gap-y-1">
        <Input
          name="confirmPassword"
          placeholder="Confirm Password"
          type="password"
          autoComplete="new-password"
        />
        <FieldError actionState={actionState} name="confirmPassword" />
      </div>

      <SubmitButton>Save</SubmitButton>
    </Form>
  );
}
