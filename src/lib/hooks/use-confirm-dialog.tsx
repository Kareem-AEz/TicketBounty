"use client";
import {
  cloneElement,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  ActionState,
  EMPTY_ACTION_STATE,
} from "@/components/form/utils/to-action-state";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogueProps = {
  title?: string;
  body?: ({ actionState }: { actionState: ActionState }) => React.ReactNode;
  autoClose?: boolean;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  action: (formData: FormData) => Promise<ActionState | undefined>;
  trigger: ((isPending: boolean) => React.ReactElement) | React.ReactElement;
  onSuccess?: (data: ActionState) => void;
  onError?: (error: ActionState) => void;
  onPendingChange?: (isPending: boolean) => void;
  onClick?: () => void;
};

export const useConfirmDialog = ({
  title = "Are you absolutely sure?",
  body: BodyComponent = ({ actionState }) => <></>,
  autoClose = true,
  description = "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loadingLabel = "Loading...",
  action,
  trigger,
  onSuccess,
  onError,
  onPendingChange,
  onClick,
}: ConfirmDialogueProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toastIdRef = useRef<string | number | undefined>(undefined);

  const wrappedAction = async (state: ActionState, formData: FormData) => {
    const toastId = toast.loading(loadingLabel);
    try {
      const result = await action(formData);

      if (result?.status === "SUCCESS") {
        toast.success(result.message || "Success!", { id: toastId });
        onSuccess?.(result);
        setIsOpen(false);
      } else if (result?.status === "ERROR") {
        toast.error(result.message || "Something went wrong!", { id: toastId });
        onError?.(result);
      } else {
        toast.dismiss(toastId);
      }

      return result ?? state;
    } catch (error) {
      toast.error("Something went wrong!", { id: toastId });
      return state;
    }
  };

  const [actionState, formAction, isPending] = useActionState(
    wrappedAction,
    EMPTY_ACTION_STATE,
  );

  const dialogTrigger = useMemo(() => {
    return cloneElement(
      typeof trigger === "function" ? trigger(isPending) : trigger,
      {
        onClick: () => {
          setIsOpen((state) => !state);
        },
      } as React.HTMLAttributes<HTMLElement>,
    );
  }, [trigger, isPending]);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      if (autoClose) setIsOpen(false);
      onClick?.();
      formAction(formData);
    });
  };

  const dialog = (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit} className="contents">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
            {BodyComponent && <BodyComponent actionState={actionState} />}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {cancelLabel}
            </AlertDialogCancel>

            <Button
              type="submit"
              disabled={isPending}
              onClick={() => {
                if (autoClose) setIsOpen(false);
              }}
            >
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [dialog, dialogTrigger, actionState, { isOpen, setIsOpen }] as const;
};
