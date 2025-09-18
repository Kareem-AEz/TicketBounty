"use client";

import React, { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import Form from "@/components/form/form";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { updatePassword } from "../actions/update-password";

export default function AccountPasswordForm() {
  const { user } = useAuth();
  const [actionState, action] = useActionState(
    updatePassword,
    EMPTY_ACTION_STATE,
  );

  return (
    <Form action={action} actionState={actionState}>
      <input type="hidden" name="id" value={user?.id ?? ""} />

      <div className="flex flex-col gap-y-1">
        <Input
          name="password"
          placeholder="New Password"
          type="password"
          autoComplete="new-password"
          defaultValue={actionState.payload?.get("password") as string}
        />
        <FieldError actionState={actionState} name="password" />
      </div>

      <div className="flex flex-col gap-y-1">
        <Input
          name="confirmPassword"
          placeholder="Confirm New Password"
          type="password"
          autoComplete="new-password"
          defaultValue={actionState.payload?.get("confirmPassword") as string}
        />
        <FieldError actionState={actionState} name="confirmPassword" />
      </div>

      <div className="flex flex-col gap-y-1">
        <Input
          name="currentPassword"
          placeholder="Current Password"
          type="password"
          defaultValue={actionState.payload?.get("currentPassword") as string}
        />
        <FieldError actionState={actionState} name="currentPassword" />
      </div>

      <SubmitButton>Update Password</SubmitButton>
    </Form>
  );
}
