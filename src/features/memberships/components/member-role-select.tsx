"use client";
import { startTransition, useActionState } from "react";
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
import { MembershipRole } from "@/generated/enums";
import { updateMembershipRole } from "../actions/update-membership-role";

type MemberRoleSelectProps = {
  currentRole: MembershipRole;
  organizationId: string;
  userId: string;
};

export default function MemberRoleSelect({
  currentRole,
  organizationId,
  userId,
}: MemberRoleSelectProps) {
  const possibleMembershipRoles = Object.values(MembershipRole);
  const [actionState, action] = useActionState(
    async (prevState: unknown, role: MembershipRole) =>
      updateMembershipRole(organizationId, userId, role),
    EMPTY_ACTION_STATE,
  );

  const handleRoleChange = (role: MembershipRole) => {
    startTransition(() => {
      action(role);
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

  return (
    <Select defaultValue={currentRole} onValueChange={handleRoleChange}>
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
}
