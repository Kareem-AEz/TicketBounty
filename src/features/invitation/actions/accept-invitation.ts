"use server";

import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { MembershipRole } from "@/generated/enums";
import prisma from "@/lib/prisma";
import { hashToken } from "@/utils/crypto";
import { validateTokenId } from "../utils/validate-token-id";

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
    // Validate token format before database queries
    validateTokenId(tokenId);

    return await prisma.$transaction(async (tx) => {
      // Hash the token for secure database lookup
      const tokenHash = hashToken(tokenId);

      // Step 1: Retrieve the invitation record using the hashed token
      const invitation = await tx.invitations.findUnique({
        where: { tokenHash },
      });

      // Step 2: Validate invitation exists and hasn't expired
      if (!invitation || invitation.expiresAt < new Date())
        throw new Error("Revoked or expired invitation");

      // Step 3: Look up the user by their email from the invitation
      const user = await tx.user.findUnique({
        where: { email: invitation.email },
      });

      if (user) {
        // User already exists: create membership and clean up invitation
        await tx.invitations.delete({
          where: { tokenHash },
        });

        await tx.membership.create({
          data: {
            userId: user.id,
            organizationId: invitation.organizationId,
            isActive: false,
            membershipRole: MembershipRole.MEMBER,
          },
        });
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
