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

  let activeOrganization = null;

  if (checkActiveOrganization) {
    activeOrganization = organizations.find(
      (organization) => organization?.membershipByUser?.isActive,
    );
    if (!activeOrganization) {
      redirect(selectActiveOrganizationPath());
    }
  }

  return { ...user, activeOrganization };
};
