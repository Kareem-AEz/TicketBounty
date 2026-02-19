"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useActionState } from "react";
import { useActionFeedback } from "@/components/form/hooks/useActionFeedback";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Organization } from "@/generated/client";
import { useToast } from "@/hooks/use-toast";
import { switchActiveOrganization } from "../actions/switch-active-organization";

type OrganizationSwitchButtonProps = {
  organization: Organization;
  trigger: React.ReactElement;
};

const OrganizationSwitchButton = ({
  organization,
  trigger,
}: OrganizationSwitchButtonProps) => {
  const [actionState, action] = useActionState(
    switchActiveOrganization.bind(null, organization.id),
    EMPTY_ACTION_STATE,
  );

  const { toast } = useToast();

  const queryClient = useQueryClient();

  useActionFeedback(actionState, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["active-organization"],
      });
      toast(
        <div className="flex items-center gap-x-2">
          <span className="">Organization Switched to:</span>
          <span className="text-primary font-mono text-xs font-medium tracking-wider">
            {organization?.name}
          </span>
        </div>,
        {
          key: `organization-switch-${organization.id}`,
        },
      );
    },
    onError() {
      toast("Failed to switch organization");
    },
  });

  return <form action={action}>{trigger}</form>;
};

export default OrganizationSwitchButton;
