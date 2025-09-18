"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { ticketPath } from "@/paths";
import { useActionFeedback } from "./hooks/useActionFeedback";
import { ActionState } from "./utils/to-action-state";

type FormProps = {
  children: React.ReactNode;
  action: (payload: FormData) => void;
  actionState: ActionState;
  isDetail?: boolean;
  onClose?: () => void;
  onSuccess?: (actionState: ActionState) => void;
  onError?: (actionState: ActionState) => void;
};

export default function Form({
  children,
  action,
  actionState,
  isDetail = false,
  onClose,
  onSuccess,
  onError,
}: FormProps) {
  const router = useRouter();

  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message && !isDetail) toast.success(actionState.message);
      if (actionState.ticketId) {
        toast.success(actionState.message, {
          action: {
            label: "View",
            onClick: () => {
              router.push(ticketPath(actionState.ticketId!));
            },
          },
        });
      }
      onSuccess?.(actionState);
      onClose?.();
    },
    onError: ({ actionState }) => {
      onError?.(actionState);
      if (actionState.message) toast.error(actionState.message);
    },
  });

  return (
    <form action={action} className="flex flex-col gap-y-5">
      {children}
    </form>
  );
}
