import { MembershipRole } from "@/generated/enums";
import { getMembershipsByOrganization } from "../queries/get-memberships-by-organization";

/**
 * Checks if the user is the last admin of the organization
 * @param organizationId - The id of the organization to check
 * @returns The id of the last admin, or null if there is no last admin
 */
export const isLastAdmin = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  try {
    const memberships = await getMembershipsByOrganization(organizationId);
    const lastAdmins = memberships.filter(
      (membership) => membership.membershipRole === MembershipRole.ADMIN,
    );
    return lastAdmins.length === 1 ? lastAdmins[0].userId : null;
  } catch (_error) {
    return null;
  }
};
