"use server";

import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { MembershipRole } from "@/generated/enums";
import prisma from "@/lib/prisma";
import { hashToken } from "@/utils/crypto";

/**
 * Server action to accept an invitation to join an organization.
 *
 * This function verifies the invitation token, validates it hasn't expired,
 * and creates a membership record for the invited user. If the user doesn't
 * exist yet, the invitation remains pending for future handling.
 *
 * @param tokenId - The raw invitation token ID to validate and process
 * @param _actionState - The form action state (passed by form framework)
 *
 * @returns A promise that resolves to an ActionState containing:
 *   - Success: { status: "SUCCESS", message: "Invitation accepted" }
 *   - Error: Error details wrapped in ActionState format
 *
 * @throws Will return error ActionState if:
 *   - Token format is invalid (validateTokenId fails)
 *   - Invitation doesn't exist or is expired
 *   - Database transaction fails
 *
 * @example
 * ```ts
 * const result = await acceptInvitation(tokenId, initialState);
 * if (result.status === "SUCCESS") {
 *   // User is now a member of the organization
 * }
 * ```
 */
export const acceptInvitation = async (
  tokenId: string,
  _actionState: ActionState,
) => {
  try {
    const tokenHash = hashToken(tokenId);
    const now = new Date();

    return await prisma.$transaction(async (tx) => {
      // Step 1: Retrieve the invitation record
      const invitation = await tx.invitations.findUnique({
        where: { tokenHash },
      });

      // Step 2: Validate invitation exists and hasn't expired
      if (!invitation || invitation.expiresAt < now) {
        throw new Error("Revoked or expired invitation");
      }

      // Step 3: Look up the user by their email from the invitation
      const user = await tx.user.findUnique({
        where: { email: invitation.email },
      });

      if (user) {
        // User exists: clean up invitation and create membership in parallel
        await Promise.all([
          tx.invitations.delete({ where: { tokenHash } }),
          tx.membership.upsert({
            where: {
              userId_organizationId: {
                userId: user.id,
                organizationId: invitation.organizationId,
              },
            },
            update: { isActive: false }, // Ensure it's set to false if it already existed
            create: {
              userId: user.id,
              organizationId: invitation.organizationId,
              isActive: false,
              membershipRole: MembershipRole.MEMBER,
            },
          }),
        ]);
      } else {
        // User doesn't exist yet: invitation stays for signup flow
        // TODO: Consider implementing pre-signup invitation flow for new users
      }

      return toSuccessActionState({
        status: "SUCCESS",
        message: "Invitation accepted",
      });
    });
  } catch (error) {
    return toErrorActionState(error);
  }
};
