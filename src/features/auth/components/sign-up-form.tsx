"use client";

import { useSearchParams } from "next/navigation";
import React, { useActionState, useState } from "react";
import zxcvbn from "zxcvbn";
import { FieldError } from "@/components/form/field-error";
import Form from "@/components/form/form";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import PasswordStrengthMeter, {
  StrengthLevel,
} from "@/features/password/components/password-strength-meter";
import { mapScoreToStrength } from "@/features/password/utils/map-score-to-strength";
import { cn } from "@/lib/utils";
import { signUp } from "../actions/sign-up";

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("invitationToken");
  const emailParam = searchParams.get("email");

  const [actionState, action] = useActionState(signUp, EMPTY_ACTION_STATE);
  const [passwordStrength, setPasswordStrength] = useState<StrengthLevel>(0);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const { score } = zxcvbn(password);

    setPasswordStrength(
      mapScoreToStrength(score, {
        password,
      }),
    );
  };

  return (
    <Form action={action} actionState={actionState}>
      {invitationToken && (
        <input type="hidden" name="invitationToken" value={invitationToken} />
      )}

      <Input
        name="username"
        placeholder="Username"
        defaultValue={actionState.payload?.get("username") as string}
      />
      <FieldError actionState={actionState} name="username" />

      <Input
        name="email"
        className={cn(
          emailParam && "pointer-events-none cursor-not-allowed opacity-50",
        )}
        placeholder="Email"
        autoComplete="email"
        readOnly={!!emailParam}
        defaultValue={
          (actionState.payload?.get("email") as string) || emailParam || ""
        }
      />
      <FieldError actionState={actionState} name="email" />

      <Input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="new-password"
        defaultValue={actionState.payload?.get("password") as string}
        onChange={handlePasswordChange}
      />
      <FieldError actionState={actionState} name="password" />

      <Input
        name="passwordConfirmation"
        type="password"
        placeholder="Password Confirmation"
        autoComplete="new-password"
        defaultValue={
          actionState.payload?.get("passwordConfirmation") as string
        }
      />
      <FieldError actionState={actionState} name="passwordConfirmation" />
      <PasswordStrengthMeter strength={passwordStrength} />
      <SubmitButton data-umami-event="sign-up-submit">Sign Up</SubmitButton>
    </Form>
  );
}
