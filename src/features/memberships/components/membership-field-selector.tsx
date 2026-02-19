"use client";

import React, {
  startTransition,
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
} from "react";
import { toast } from "sonner";
import {
  ActionState,
  EMPTY_ACTION_STATE,
} from "@/components/form/utils/to-action-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MembershipRole } from "@/generated/client";
import { updateMembership } from "../actions/update-membership";

type MembershipUpdateableFields =
  | "membershipRole"
  | "canDeleteTickets"
  | "isActive";

type MembershipFieldSelectorProps<T extends boolean | MembershipRole> = {
  organizationId: string;

  userId: string;
  field: MembershipUpdateableFields;
  currentValue: T;
  options: { label: string; value: T }[];
  disabled?: boolean;
  disabledReason?: string;
};

export default function MembershipFieldSelector<
  T extends boolean | MembershipRole,
>({
  organizationId,
  userId,
  field,
  currentValue,
  options,
  disabled,
  disabledReason,
}: MembershipFieldSelectorProps<T>) {
  const promiseRef = useRef<Promise<ActionState | undefined> | null>(null);
  const wrappedAction = async (state: ActionState, value: T) => {
    const promise = updateMembership(organizationId, userId, {
      [field]: value,
    });
    promiseRef.current = promise;
    const result = await promise;
    return result ?? state;
  };

  const [actionState, action, isPending] = useActionState(
    wrappedAction,
    EMPTY_ACTION_STATE,
  );

  const [optimisticValue, setOptimisticValue] = useOptimistic(
    currentValue,
    (state, newValue: T) => newValue,
  );

  const handleValueChange = (value: T) => {
    startTransition(() => {
      setOptimisticValue(value);
      action(value);
    });
  };

  const label = (
    <span className="text-muted-foreground bg-muted-foreground/5 rounded-md px-2 py-0.5 font-mono text-xs tracking-wider uppercase">
      {field}
    </span>
  );

  useEffect(() => {
    if (isPending && promiseRef.current) {
      const promise = promiseRef.current.then((result) => {
        if (result?.status === "ERROR") {
          throw result;
        }
        return result;
      });

      toast.promise(promise, {
        loading: (
          <div className="flex items-center gap-1">
            {label}
            Updating...
          </div>
        ),
        success: (data) => {
          console.log(data);
          return (
            <div className="flex items-center gap-1">
              {label}
              Updated
            </div>
          );
        },
        error: (error) => {
          return (
            <div className="flex items-center gap-1">
              {label}
              Failed to update
            </div>
          );
        },
      });

      promiseRef.current = null;
    }
  }, [isPending]);

  const select = (
    <Select
      value={optimisticValue.toString()}
      onValueChange={(value) => {
        const selectedOption = options.find(
          (option) => option.value.toString() === value,
        );

        if (selectedOption) {
          handleValueChange(selectedOption.value);
        }
      }}
      disabled={isPending || disabled}
    >
      <SelectTrigger className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
        <SelectValue
          className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
          placeholder={field}
        />
      </SelectTrigger>

      <SelectContent className="font-mono text-xs tracking-wider uppercase">
        {options.map((option) => (
          <SelectItem key={option.label} value={option.value.toString()}>
            <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              [{option.label}]
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (disabledReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{select}</div>
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-muted-foreground font-mono text-xs">
            {disabledReason}
          </span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return select;
}
