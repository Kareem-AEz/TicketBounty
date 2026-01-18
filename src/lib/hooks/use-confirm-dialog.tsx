"use client";
import {
  cloneElement,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useActionFeedback } from "@/components/form/hooks/useActionFeedback";
import {
  ActionState,
  EMPTY_ACTION_STATE,
} from "@/components/form/utils/to-action-state";
import {
  AlertDialog,
  AlertDialogAction,
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
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  action: () => Promise<ActionState | undefined>;
  trigger: ((isPending: boolean) => React.ReactElement) | React.ReactElement;
  onSuccess?: (data: ActionState) => void;
  onError?: (error: ActionState) => void;
  onPendingChange?: (isPending: boolean) => void;
};

export const useConfirmDialog = ({
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loadingLabel = "Loading...",
  action,
  trigger,
  onSuccess,
  onError,
  onPendingChange,
}: ConfirmDialogueProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const promiseRef = useRef<Promise<ActionState | undefined> | null>(null);

  // Wrapper action that stores the promise for toast.promise
  const wrappedAction = async () => {
    const promise = action();
    promiseRef.current = promise;
    return promise;
  };

  const [actionState, formAction, isPending] = useActionState(
    wrappedAction,
    EMPTY_ACTION_STATE,
  );

  const dialogTrigger = cloneElement(
    typeof trigger === "function" ? trigger(isPending) : trigger,
    {
      onClick: () => setIsOpen((state) => !state),
    } as React.HTMLAttributes<HTMLElement>,
  );

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  // Track when action starts and use toast.promise
  useEffect(() => {
    if (isPending && promiseRef.current) {
      const promise = promiseRef.current.then((result) => {
        if (result?.status === "ERROR") {
          throw result;
        }
        return result;
      });

      toast.promise(promise, {
        loading: loadingLabel,
        success: (data) => {
          return data?.message || "Success!";
        },
        error: (error) => {
          return error?.message || "Something went wrong!";
        },
      });

      // Clear the ref after using it
      promiseRef.current = null;
    }
  }, [isPending, loadingLabel]);

  useActionFeedback(actionState ?? EMPTY_ACTION_STATE, {
    onSuccess: ({ actionState }) => {
      setIsOpen(false);
      onSuccess?.(actionState);
    },
    onError: ({ actionState }) => {
      onError?.(actionState);
    },
  });

  const dialog = (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <form action={formAction} className="contents">
            <AlertDialogAction asChild>
              <Button type="submit" disabled={isPending}>
                {confirmLabel}
              </Button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [dialog, dialogTrigger] as const;
};
