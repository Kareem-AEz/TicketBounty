"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import Form from "@/components/form/form";
import SubmitButton from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { organizationsPath } from "@/paths";
import { acceptInvitation } from "../actions/accept-invitation";

export default function InvitationAcceptForm({ tokenId }: { tokenId: string }) {
  const router = useRouter();
  const [actionState, action] = useActionState(
    acceptInvitation.bind(null, tokenId),
    EMPTY_ACTION_STATE,
  );

  return (
    <Form
      action={action}
      actionState={actionState}
      onSuccess={() => {
        router.push(organizationsPath());
      }}
    >
      <SubmitButton>Accept Invitation</SubmitButton>
    </Form>
  );
}
