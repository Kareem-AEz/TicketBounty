import { useQuery } from "@tanstack/react-query";
import { getCurrentActiveOrganization } from "../queries/get-current-active-organization";

export const useCurrentActiveOrganization = () => {
  const { data: currentActiveOrganization } = useQuery({
    queryKey: ["current-active-organization"],
    queryFn: () => getCurrentActiveOrganization(),
  });

  return currentActiveOrganization;
};
