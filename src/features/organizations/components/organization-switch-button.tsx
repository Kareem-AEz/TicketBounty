"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useActionState } from "react";
import Form from "@/components/form/form";
import { useActionFeedback } from "@/components/form/hooks/useActionFeedback";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { switchActiveOrganization } from "../actions/switch-active-organization";

type OrganizationSwitchButtonProps = {
  organizationId: string;
  trigger: React.ReactElement;
};

const OrganizationSwitchButton = ({
  organizationId,
  trigger,
}: OrganizationSwitchButtonProps) => {
  const [actionState, action] = useActionState(
    switchActiveOrganization.bind(null, organizationId),
    EMPTY_ACTION_STATE,
  );

  const queryClient = useQueryClient();

  useActionFeedback(actionState, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["active-organization"],
      });
    },
  });

  return (
    <Form action={action} actionState={actionState}>
      {trigger}
    </Form>
  );
};

export default OrganizationSwitchButton;
