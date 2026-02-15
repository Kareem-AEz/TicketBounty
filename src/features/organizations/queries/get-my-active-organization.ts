import { getAuth } from "@/features/auth/queries/get-auth";
import { getMyOrganizations } from "./get-my-organizations";

export const getMyActiveOrganization = async () => {
  const { user } = await getAuth();
  if (!user) return null;

  const organizations = await getMyOrganizations();
  return (
    organizations.find(
      (organization) => organization.membershipByUser?.isActive,
    ) ?? null
  );
};
