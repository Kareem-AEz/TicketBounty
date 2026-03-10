"use server";

import { revalidatePath } from "next/cache";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { isUserAdmin } from "@/features/memberships/utils/is-user-admin";
import prisma from "@/lib/prisma";
import { organizationInvitationsPath } from "@/paths";

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
    const result = await prisma.$transaction(async (tx) => {
      await tx.invitations.delete({
        where: { tokenHash, organizationId: organizationId },
      });
      revalidatePath(organizationInvitationsPath(organizationId));
      return toSuccessActionState({
        status: "SUCCESS",
        message: "Invitation deleted",
      });
    });
    return result;
  } catch (error) {
    return toErrorActionState(error);
  }
};
