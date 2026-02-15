"use client";

import { LucideLoaderCircle, LucideLogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { removeMember } from "@/features/memberships/actions/remove-member";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";

type OrganizationDeleteButtonProps = {
  memberId: string;
  organizationId: string;
};
export default function MemberDeleteButton({
  memberId,
  organizationId,
}: OrganizationDeleteButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isCurrentUser = user?.id === memberId;

  const [dialog, dialogTrigger] = useConfirmDialog({
    title: isCurrentUser ? "Leave Organization" : "Delete Member",
    description: isCurrentUser
      ? "Are you sure you want to leave this organization?"
      : "Are you sure you want to delete this member?",
    confirmLabel: isCurrentUser ? "Leave" : "Delete",
    cancelLabel: "Cancel",
    loadingLabel: isCurrentUser
      ? "Leaving organization..."
      : "Deleting member...",

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
              <LucideLogOut />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    ),
    action: removeMember.bind(null, organizationId, memberId),

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
