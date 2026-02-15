import { useQuery } from "@tanstack/react-query";
import { getMyActiveOrganization } from "../queries/get-my-active-organization";

export const useCurrentActiveOrganization = () => {
  const { data: activeOrganization } = useQuery({
    queryKey: ["active-organization"],
    queryFn: () => getMyActiveOrganization(),
  });

  return activeOrganization;
};
