"use client";
import { LucidePencil } from "lucide-react";
import { flattenError } from "zod/v4";
import { FieldError } from "@/components/form/field-error";
import { ActionState } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { updateOrganization } from "../actions/update-organization";
import { updateOrganizationSchema } from "../validations/update-organization.schema";

type OrganizationEditButtonProps = {
  organizationId: string;
};

export default function OrganizationEditButton({
  organizationId,
}: OrganizationEditButtonProps) {
  const [dialog, dialogTrigger, actionState, { setIsOpen }] = useConfirmDialog({
    title: "Edit Organization",
    description: "Change the organization's details below.",
    confirmLabel: "Edit",
    cancelLabel: "Cancel",
    loadingLabel: "Editing organization...",
    autoClose: false,
    action: async (formData: FormData) => {
      const result = updateOrganizationSchema.safeParse(
        Object.fromEntries(formData),
      );
      if (!result.success) {
        return {
          status: "ERROR",
          message: result.error.issues.map((issue) => issue.message).join(", "),
          fieldErrors: flattenError(result.error).fieldErrors,
          timestamp: new Date().getTime(),
        };
      }
      return await updateOrganization(organizationId, formData);
    },
    trigger: (isPending) => (
      <Button variant="outline" size="icon" disabled={isPending}>
        <LucidePencil />
      </Button>
    ),
    body: ({ actionState }: { actionState: ActionState }) => (
      <div className="mt-6 flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input name="name" placeholder="Name" />
        <FieldError actionState={actionState} name="name" />
      </div>
    ),
  });

  return (
    <>
      {dialogTrigger}
      {dialog}
    </>
  );
}
