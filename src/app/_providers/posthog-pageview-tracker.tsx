"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";

function PostHogPageViewTrackerInternal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    // Track pageview whenever pathname or search params change
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }

      posthog.capture("$pageview", {
        $current_url: url,
      });

      // Opt out of capturing on localhost
      if (window.location.hostname === "localhost") {
        posthog.opt_out_capturing();
      }
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

export default function PostHogPageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewTrackerInternal />
    </Suspense>
  );
}
