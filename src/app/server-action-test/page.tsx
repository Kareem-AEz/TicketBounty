// RSC Page
// src/app/server-action-test/page.tsx

import React from "react";
import { Button } from "@/components/ui/button";

export default function ServerActionTestPage() {
  // Server Action
  const handleServerActionLog = async () => {
    "use server";

    console.log("=");
    console.log("=");
    console.log("=");
    console.log("========================");
    console.log(
      `server action log ${new Date().getMinutes()}:${new Date().getSeconds()}`,
    );
    console.log("========================");
    console.log("=");
    console.log("=");
    console.log("=");
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      {/* Button with onClick handler to call the server action */}
      <Button onClick={handleServerActionLog}>server action log</Button>
    </div>
  );
}
