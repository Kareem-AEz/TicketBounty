import { redirect } from "next/navigation";
import { signInPath } from "@/paths";
import { getAuth } from "./get-auth";

export const getAuthOrRedirect = async () => {
  const { user } = await getAuth();
  if (!user) {
    redirect(signInPath());
  }
  return user;
};
