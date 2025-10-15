"use client";

import React, { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import Form from "@/components/form/form";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { signIn } from "../actions/sign-in";

export default function SignInForm() {
  const [actionState, action] = useActionState(signIn, EMPTY_ACTION_STATE);

  return (
    <Form action={action} actionState={actionState}>
      <Input
        name="email"
        placeholder="Email"
        defaultValue={actionState.payload?.get("email") as string}
        autoComplete="email"
      />
      <FieldError actionState={actionState} name="email" />

      <Input
        name="password"
        placeholder="Password"
        type="password"
        autoComplete="new-password"
        defaultValue={actionState.payload?.get("password") as string}
      />
      <FieldError actionState={actionState} name="password" />

      <SubmitButton data-umami-event="sign-in-submit">Sign In</SubmitButton>
    </Form>
  );
}
