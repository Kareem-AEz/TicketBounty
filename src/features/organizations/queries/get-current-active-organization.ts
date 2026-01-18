import { getAuth } from "@/features/auth/queries/get-auth";
import { getOrganizationsByUserId } from "./get-organizations-by-user-id";

export const getCurrentActiveOrganization = async () => {
  const { user } = await getAuth();
  if (!user) return null;

  const organizations = await getOrganizationsByUserId();
  return (
    organizations.find(
      (organization) => organization.membershipByUser?.isActive,
    ) ?? null
  );
};
