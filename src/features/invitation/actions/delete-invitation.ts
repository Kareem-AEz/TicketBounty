import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { isUserAdmin } from "@/features/memberships/utils/is-user-admin";
import prisma from "@/lib/prisma";

type DeleteInvitationProps = {
  tokenHash: string;
  organizationId: string;
};

export const deleteInvitation = async ({
  tokenHash,
  organizationId,
}: DeleteInvitationProps) => {
  try {
    const isAdmin = await isUserAdmin({ organizationId });
    if (!isAdmin) {
      return toErrorActionState(
        new Error("You are not authorized to delete this invitation"),
      );
    }
    await prisma.$transaction(async (tx) => {
      await tx.invitations.delete({
        where: { tokenHash, organizationId: organizationId },
      });
      return toSuccessActionState({
        status: "SUCCESS",
        message: "Invitation deleted",
      });
    });
  } catch (error) {
    return toErrorActionState(error);
  }
};
