"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    // Check if user has already made a choice
    if (posthog && !posthog.has_opted_in_capturing() && !posthog.has_opted_out_capturing()) {
      setShowBanner(true);
    }
  }, [posthog]);

  const handleAccept = () => {
    posthog.opt_in_capturing();
    posthog.set_config({ persistence: "localStorage+cookie" });
    setShowBanner(false);
  };

  const handleDecline = () => {
    posthog.opt_out_capturing();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-border bg-background shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Cookie Consent</CardTitle>
          <CardDescription>
            We use cookies to improve your experience and analyze site traffic.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground text-sm">
            PostHog uses a single first-party cookie. No data is sent to third parties.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleDecline} size="sm">
            Decline
          </Button>
          <Button onClick={handleAccept} size="sm">
            Accept
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

