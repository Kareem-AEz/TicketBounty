"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { getAuth } from "@/features/auth/queries/get-auth";

export default function PostHogAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    const identifyUser = async () => {
      try {
        const { user } = await getAuth();
        if (user) {
          // Identify the user if they are not already identified as this user
          if (posthog.get_distinct_id() !== user.id) {
            posthog.identify(user.id, {
              email: user.email,
              username: user.username,
            });
          }
        }
      } catch (error) {
        console.error("Failed to identify user in PostHog:", error);
      }
    };

    identifyUser();
  }, [posthog]);

  return <>{children}</>;
}
