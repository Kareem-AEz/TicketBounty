"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) {
      console.warn("NEXT_PUBLIC_POSTHOG_KEY is not set");
      return;
    }
    posthog.init(key, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // We handle this manually in the tracker
      capture_exceptions: true,
      disable_session_recording: true,

      // GDPR Compliance:
      // 1. We default to 'memory' persistence (cookieless) until consent.
      // 2. We don't automatically capture until we confirm.
      // However, to keep it simple with the banner, we usually rely on opt_in_capturing logic.
      // If you want strict GDPR, use 'memory' persistence by default:
      // persistence: "memory",
    });

    const initialize = () => setIsInitialized(true);
    initialize();
  }, []);

  if (!isInitialized) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
