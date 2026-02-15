import { Membership, MembershipRole } from "@/generated/client";

type MembershipSelectorsParams = {
  memberships: Membership[];
  userId: string;
};

export const membershipSelectors = ({
  memberships,
  userId,
}: MembershipSelectorsParams) => {
  const myMembership = memberships.find(
    (membership) => membership.userId === userId,
  );
  const admins = memberships.filter(
    (membership) => membership.membershipRole === MembershipRole.ADMIN,
  );

  return {
    isAdmin: myMembership?.membershipRole === MembershipRole.ADMIN,
    isOnlyAdmin: admins.length === 1,
    onlyAdminId: admins.length === 1 ? admins[0].userId : null,
    totalMembers: memberships.length,
    totalAdmins: admins.length,
    myMembership,
  };
};
