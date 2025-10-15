"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signInPath } from "@/paths";
import { signOut } from "../actions/sign-out";

export default function SignOutButton() {
  // Hooks
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Event handlers
  const handleSignOut = () => {
    // Clear auth cache immediately to prevent stale data
    queryClient.setQueryData(["auth", "guard"], null);
    queryClient.removeQueries({ queryKey: ["auth", "guard"] });

    startTransition(async () => {
      await signOut();
      router.push(signInPath());
    });
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isPending}
      data-umami-event="sign-out"
    >
      <motion.span
        layout="position"
        className="flex items-center gap-2 select-none"
        style={{
          originY: "0px",
          originX: "0px",
        }}
      >
        Sign Out
      </motion.span>
    </Button>
  );
}
