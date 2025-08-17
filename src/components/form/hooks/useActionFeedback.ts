import { useEffect, useRef } from "react";
import { ActionState } from "../utils/to-action-state";

type OnArgs = {
  actionState: ActionState;
};

type UseActionFeedbackOptions = {
  onSuccess?: (onArgs: OnArgs) => void;
  onError?: (onArgs: OnArgs) => void;
};

export const useActionFeedback = (
  actionState: ActionState,
  options: UseActionFeedbackOptions,
) => {
  const previousActionStateRef = useRef<ActionState | undefined>(undefined);

  useEffect(() => {
    // Only process if actionState has actually changed
    if (previousActionStateRef.current === actionState) return;

    if (actionState.status === "SUCCESS") {
      options.onSuccess?.({
        actionState,
      });
    }

    if (actionState.status === "ERROR") {
      options.onError?.({
        actionState,
      });
    }

    previousActionStateRef.current = actionState;
  }, [actionState, options]);
};
