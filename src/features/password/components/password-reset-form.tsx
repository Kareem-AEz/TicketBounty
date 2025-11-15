"use client";

import React, { useActionState, useState } from "react";
import zxcvbn from "zxcvbn";
import { FieldError } from "@/components/form/field-error";
import Form from "@/components/form/form";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { resetPassword } from "../actions/reset-password";
import { mapScoreToStrength } from "../utils/map-score-to-strength";
import PasswordStrengthMeter, {
  type StrengthLevel,
} from "./password-strength-meter";

export default function PasswordResetForm({ tokenId }: { tokenId: string }) {
  const [actionState, action] = useActionState(
    resetPassword.bind(null, tokenId),
    EMPTY_ACTION_STATE,
  );
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
      <Input
        name="password"
        placeholder="New Password"
        type="password"
        defaultValue={actionState.payload?.get("password") as string}
        onChange={handlePasswordChange}
        autoComplete="off"
      />
      <FieldError actionState={actionState} name="password" />

      <Input
        name="confirmPassword"
        placeholder="Confirm New Password"
        type="password"
        autoComplete="off"
        defaultValue={actionState.payload?.get("confirmPassword") as string}
      />
      <FieldError actionState={actionState} name="confirmPassword" />

      <PasswordStrengthMeter strength={passwordStrength} />

      <SubmitButton>Reset Password</SubmitButton>
    </Form>
  );
}
