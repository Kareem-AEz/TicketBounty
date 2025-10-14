"use client";

import React, { useEffect, useState } from "react";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import Spinner from "./spinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isFetched, setIsFetched] = useState(false);
  useEffect(() => {
    async function fetchAuth() {
      await getAuthOrRedirect();
      setIsFetched(true);
    }
    fetchAuth();
  }, []);

  if (!isFetched) return <Spinner />;
  return <>{children}</>;
}
