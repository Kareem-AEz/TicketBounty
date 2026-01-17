import { redirect } from "next/navigation";
import { getOrganizationsByUserId } from "@/features/organizations/queries/get-organizations-by-user-id";
import {
  onboardingPath,
  selectActiveOrganizationPath,
  signInPath,
} from "@/paths";
import { getAuth } from "./get-auth";

interface GetAuthOrRedirectOptions {
  checkActiveOrganization?: boolean;
}

export const getAuthOrRedirect = async ({
  checkActiveOrganization = true,
}: GetAuthOrRedirectOptions = {}) => {
  const { user } = await getAuth();
  if (!user) {
    redirect(signInPath());
  }

  const organizations = await getOrganizationsByUserId();
  if (organizations.length === 0) {
    redirect(onboardingPath());
  }

  if (checkActiveOrganization) {
    const hasActiveOrganization = organizations.some(
      (organization) => organization.membershipByUser?.isActive,
    );
    if (!hasActiveOrganization) {
      redirect(selectActiveOrganizationPath());
    }
  }

  return user;
};
