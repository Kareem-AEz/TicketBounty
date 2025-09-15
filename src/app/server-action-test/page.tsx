import React from "react";
import { Button } from "@/components/ui/button";

export default function page() {
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
      <Button onClick={handleServerActionLog}>server action log</Button>
    </div>
  );
}
