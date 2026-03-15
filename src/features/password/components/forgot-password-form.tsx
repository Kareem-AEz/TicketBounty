"use client";

import React, { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import Form from "@/components/form/form";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "../actions/forgot-password";

export default function ForgotPasswordForm() {
  const [actionState, action] = useActionState(
    forgotPassword,
    EMPTY_ACTION_STATE,
  );

  return (
    <Form action={action} actionState={actionState}>
      <Input
        name="email"
        placeholder="Email"
        defaultValue={actionState.payload?.get("email") as string}
        autoComplete="email"
      />
      <FieldError actionState={actionState} name="email" />

      <SubmitButton data-umami-event="forgot-password-submit">
        Forgot Password
      </SubmitButton>
    </Form>
  );
}
