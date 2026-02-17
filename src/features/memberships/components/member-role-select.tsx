"use client";
import { startTransition, useActionState, useOptimistic } from "react";
import { toast } from "sonner";
import { useActionFeedback } from "@/components/form/hooks/useActionFeedback";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MembershipRole } from "@/generated/enums";
import { updateMemberRole } from "../actions/update-member-role";

type MemberRoleSelectProps = {
  currentRole: MembershipRole;
  organizationId: string;
  userId: string;
  lastAdminId?: string | null;
};

const possibleMembershipRoles = Object.values(MembershipRole);

export default function MemberRoleSelect({
  currentRole,
  organizationId,
  userId,
  lastAdminId = null,
}: MemberRoleSelectProps) {
  const [actionState, action, isPending] = useActionState(
    async (prevState: unknown, role: MembershipRole) =>
      updateMemberRole(organizationId, userId, role),
    EMPTY_ACTION_STATE,
  );

  const [optimisticRole, setOptimisticRole] = useOptimistic(
    currentRole,
    (state, newRole: MembershipRole) => newRole,
  );

  const isLastAdmin = lastAdminId === userId;
  const isDisabled = isPending || isLastAdmin;

  const handleRoleChange = (newRole: MembershipRole) => {
    startTransition(() => {
      setOptimisticRole(newRole);
      action(newRole);
    });
  };

  useActionFeedback(actionState, {
    onSuccess() {
      toast.success("Membership role updated");
    },
    onError({ actionState }) {
      toast.error(actionState.message);
    },
  });

  const select = isLastAdmin ? (
    <Tooltip>
      <Select value={optimisticRole} disabled={true}>
        <TooltipTrigger asChild>
          <SelectTrigger className="w-full max-w-48 font-mono tracking-wider uppercase">
            <SelectValue className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                [{optimisticRole}]
              </span>
            </SelectValue>
          </SelectTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">
          <span className="text-muted-foreground font-mono text-xs">
            You cannot change the role of the last admin
          </span>
        </TooltipContent>
      </Select>
    </Tooltip>
  ) : (
    <Select
      value={optimisticRole}
      onValueChange={handleRoleChange}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-full max-w-48 font-mono tracking-wider uppercase">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent className="font-mono tracking-wider uppercase">
        <SelectGroup>
          <SelectLabel className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
            Role
          </SelectLabel>
          <SelectSeparator />
          {possibleMembershipRoles.map((role) => (
            <SelectItem key={role} value={role}>
              <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                [{role}]
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  return select;
}
