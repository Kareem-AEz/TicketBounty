"use client";

import { LucideLoaderCircle, LucideTrash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { deleteUserOrganization } from "../actions/delete-user-organization";
import { useDeletingUserOrganization } from "../contexts/deleting-organization-context";

type OrganizationDeleteButtonProps = {
  organizationId: string;
};
export default function OrganizationDeleteButton({
  organizationId,
}: OrganizationDeleteButtonProps) {
  const { setDeletingUserOrganizationId } = useDeletingUserOrganization();
  const router = useRouter();

  const [dialog, dialogTrigger] = useConfirmDialog({
    title: "Delete Organization",
    description: "Are you sure you want to delete this organization?",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    trigger: (isPending) => (
      <Button
        variant="destructive"
        className="relative"
        size="icon"
        disabled={isPending}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isPending ? (
            <motion.div
              key="loading-delete"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
            >
              <LucideLoaderCircle className="animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="trash-delete"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
            >
              <LucideTrash2 />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    ),
    action: deleteUserOrganization.bind(null, organizationId),
    onPendingChange: (isPending) => {
      setDeletingUserOrganizationId(isPending ? organizationId : null);
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <>
      {dialogTrigger}
      {dialog}
    </>
  );
}
