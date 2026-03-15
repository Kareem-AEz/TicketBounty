"use client";

import React from "react";
import Placeholder from "@/components/placeholder";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Placeholder
      label={error.message || copy.errors.general}
      button={
        <Button variant="outline" onClick={() => reset()}>
          {copy.actions.tryAgain}
        </Button>
      }
    />
  );
}

export default Error;
