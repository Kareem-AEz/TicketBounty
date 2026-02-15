import { redirect } from "next/navigation";
import { getMyOrganizations } from "@/features/organizations/queries/get-my-organizations";
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

  const organizations = await getMyOrganizations();
  if (organizations.length === 0) {
    redirect(onboardingPath());
  }

  if (checkActiveOrganization) {
    const hasActiveOrganization = organizations.some(
      (organization) => organization?.membershipByUser?.isActive ?? false,
    );
    if (!hasActiveOrganization) {
      redirect(selectActiveOrganizationPath());
    }
  }

  return user;
};
