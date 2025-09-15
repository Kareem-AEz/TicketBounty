import { User } from "lucia";
import { useEffect, useState } from "react";
import { getAuth } from "../queries/get-auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getAuth();
      setUser(user);
      setIsFetched(true);
    };
    fetchUser();
  }, []); // Only fetch once on mount, not on every route change

  return { user, isFetched };
};
