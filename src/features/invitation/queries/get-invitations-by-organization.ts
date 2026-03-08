import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { isUserAdmin } from "@/features/memberships/utils/is-user-admin";
import { Prisma } from "@/generated/browser";
import prisma from "@/lib/prisma";

export const getInvitationsByOrganization = async (
  organizationId: string,
): Promise<
  ActionState<
    Prisma.InvitationsGetPayload<{
      include: {
        invitedByUser: {
          select: {
            email: true;
            username: true;
          };
        };
      };
    }>[]
  >
> => {
  try {
    const isAdmin = await isUserAdmin({ organizationId });

    if (!isAdmin)
      throw new Error(
        "You are not authorized to view this organization's invitations",
      );

    const invitations = await prisma.invitations.findMany({
      where: { organizationId },
      include: {
        invitedByUser: {
          select: {
            email: true,
            username: true,
          },
        },
      },
    });

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Invitations fetched successfully",
      data: invitations,
    });
  } catch (error) {
    return toErrorActionState(error);
  }
};
