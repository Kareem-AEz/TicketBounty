"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signInPath } from "@/paths";
import { signOut } from "../actions/sign-out";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push(signInPath());
    });
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isPending}
      className=""
      data-umami-event="sign-out"
    >
      {/* {isPending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <Spinner size="sm" />
        </motion.div>
      )} */}

      <motion.span
        layout="position"
        className="flex items-center gap-2 select-none"
        style={{
          originY: "0px",
          originX: "0px",
        }}
      >
        {"Sign Out"}
      </motion.span>
    </Button>
  );
}
