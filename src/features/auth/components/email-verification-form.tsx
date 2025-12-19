"use client";

import { MailIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import Form from "@/components/form/form";
import { useActionFeedback } from "@/components/form/hooks/useActionFeedback";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { inngest } from "@/lib/inngest";
import { ticketsPath } from "@/paths";
import { verifyEmail } from "../actions/verify-email";
import { getAuth } from "../queries/get-auth";

const RESEND_COUNTDOWN = 60;

export default function EmailVerificationForm() {
  const [actionState, action] = useActionState(verifyEmail, EMPTY_ACTION_STATE);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otp, setOtp] = useState("");

  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      toast.success(actionState.message);
      redirect(ticketsPath());
    },
    onError: ({ actionState }) => {
      toast.error(actionState.message);
    },
  });

  //   --------------- RESEND CODE ---------------
  const handleResend = async () => {
    if (resendCountdown > 0 || isResending) return;

    const auth = await getAuth();
    if (!auth.user) {
      toast.error("Unauthorized");
      return;
    }

    setIsResending(true);
    await inngest.send({
      name: "app/auth.send-email-verification-code-function",
      data: {
        userId: auth.user.id,
      },
    });

    setResendCountdown(RESEND_COUNTDOWN);
    setIsResending(false);
  };

  //   --------------- RESEND COUNTDOWN ---------------
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown((prev) => prev - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  return (
    <Card className="w-full max-w-md gap-y-8">
      <CardHeader className="mb-0">
        <CardTitle className="flex items-center gap-2">
          <MailIcon className="h-4 w-4" />
          Verify Your Email
        </CardTitle>
        <CardDescription>Verify your email address to continue</CardDescription>
      </CardHeader>
      <CardContent className="mb-0">
        <Form action={action} actionState={actionState}>
          <div className="mx-auto flex w-min flex-col justify-center gap-y-4">
            <InputOTP
              maxLength={8}
              value={otp}
              onChange={(value) => setOtp(value)}
              name="code"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
            <SubmitButton
              type="submit"
              className="w-full"
              disabled={otp.length !== 8}
            >
              Verify Email
            </SubmitButton>
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex h-full">
        <p className="text-muted-foreground inline-block text-sm">
          Didn&apos;t receive the code?
        </p>
        <div className="ml-2 flex h-8 items-center text-sm">
          {resendCountdown > 0 ? (
            <span className="text-muted-foreground">
              Resend in {resendCountdown} seconds
            </span>
          ) : (
            <Button
              className="text-primary w-full font-medium"
              variant={"link"}
              size={"icon"}
              onClick={handleResend}
              disabled={isResending || resendCountdown > 0}
            >
              {isResending ? "Resending..." : "Resend Code"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
