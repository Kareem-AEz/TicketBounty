"use client";
import {
  cloneElement,
  useActionState,
  useEffect,
  useMemo,
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
}: ConfirmDialogueProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const promiseRef = useRef<Promise<ActionState | undefined> | null>(null);

  // Wrapper action that stores the promise for toast.promise
  const wrappedAction = async (state: ActionState, formData: FormData) => {
    const promise = action(formData);
    promiseRef.current = promise;
    const result = await promise;

    return result ?? state;
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
      onSuccess?.(actionState);
      setIsOpen(false);
    },
    onError: ({ actionState }) => {
      onError?.(actionState);
    },
  });

  const dialog = (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <form action={formAction} className="contents">
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
