import { redirect } from "next/navigation";
import { getOrganizationsByUserId } from "@/features/organizations/queries/get-organizations-by-user-id";
import { onboardingPath, signInPath } from "@/paths";
import { getAuth } from "./get-auth";

export const getAuthOrRedirect = async () => {
  const { user } = await getAuth();
  if (!user) {
    redirect(signInPath());
  }

  const organizations = await getOrganizationsByUserId();
  if (organizations.length === 0) {
    redirect(onboardingPath());
  }
  return user;
};
