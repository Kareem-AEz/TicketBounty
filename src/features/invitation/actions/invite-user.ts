"use server";

import console from "console";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { MembershipRole } from "@/generated/enums";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { organizationInvitationsPath } from "@/paths";
import { generateInvitationLink } from "../utils/generate-invitation-link";

const schema = z.object({
  organizationId: z.string(),
  email: z.email(),
});

export const inviteUser = async ({
  organizationId,
  email,
}: {
  organizationId: string;
  email: string;
}) => {
  try {
    const validatedFields = schema.safeParse({ organizationId, email });
    if (!validatedFields.success) {
      throw new Error("Invalid fields");
    }
    const authUser = await getAuthOrRedirect();

    if (!authUser) {
      return toErrorActionState(new Error("Unauthorized"));
    }

    const result = await prisma.$transaction(async (tx) => {
      // This triple query fetches:
      // 1. The user by email, including their memberships for this org.
      // 2. If there is an existing invitation for the same email/org.
      // 3. The user sending the invite, only if they're a member (used for admin check).
      //
      // This approach minimizes DB roundtrips and does as much validation as possible up front.
      // Some may argue this is a little "clever" (could split queries for clarity or if you need atomicity per check),
      // but for transactional context and minimizing latency, it's an efficient and appropriate use of Promise.all.

      const [user, isUserAlreadyInvited, invitedByUser, organization] =
        await Promise.all([
          tx.user.findUnique({
            where: { email },
            include: {
              memberships: {
                where: {
                  organizationId,
                },
                select: {
                  organizationId: true,
                },
              },
            },
          }),
          tx.invitations.findFirst({
            where: {
              email,
              organizationId,
            },
          }),
          tx.user.findUnique({
            where: {
              id: authUser?.id,
            },
            select: {
              id: true,
              memberships: {
                where: {
                  organizationId,
                },
                select: {
                  organizationId: true,
                  membershipRole: true,
                },
              },
            },
          }),
          tx.organization.findUnique({
            where: {
              id: organizationId,
            },
            select: {
              name: true,
            },
          }),
        ]);

      if (!organization) {
        throw new Error("Organization not found");
      }

      const isUserAMemberOfTheOrganization = user?.memberships?.some(
        (membership) => membership.organizationId === organizationId,
      );

      if (isUserAMemberOfTheOrganization) {
        throw new Error("User already a member of the organization");
      }

      // The condition checks if the user has already been invited *and*
      // the invitation is not expired (i.e., invitation is still valid).
      // This is correct: it prevents re-inviting users with an active (non-expired) invitation.
      if (isUserAlreadyInvited && isUserAlreadyInvited.expiresAt > new Date()) {
        throw new Error("User already invited");
      }
      const isInvitedByUserAnAdmin =
        invitedByUser?.memberships[0]?.membershipRole === MembershipRole.ADMIN;
      if (!isInvitedByUserAnAdmin) {
        throw new Error("You are not authorized to invite users");
      }

      const invitationLink = await generateInvitationLink({
        tx,
        organizationId,
        email,
        invitedByUserId: authUser.id,
      });

      await inngest.send({
        name: "app/invitation.send-link",
        data: {
          invitationLink,
          organizationName: organization.name,
          inviterName: authUser.username,
          toEmail: validatedFields.data.email,
        },
      });

      return toSuccessActionState({
        status: "SUCCESS",
        message: "Invitation sent successfully",
        data: {
          invitationLink,
        },
      });
    });

    revalidatePath(organizationInvitationsPath(organizationId));
    return result;
  } catch (error) {
    console.error(error);
    const errorFormData = new FormData();
    if (typeof email === "string") {
      errorFormData.set("email", email);
    }
    return toErrorActionState(error, errorFormData);
  }
};
