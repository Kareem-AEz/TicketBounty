"use client";

import { motion } from "motion/react";
import React, { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import Spinner from "../spinner";
import { Button } from "../ui/button";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  onFinish?: () => void;
};

function SubmitButton({
  children,
  className,
  pendingLabel,
  onFinish,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const prevPendingRef = useRef(pending);

  useEffect(() => {
    // If pending was true and is now false, submission finished
    if (prevPendingRef.current && !pending) {
      onFinish?.();
    }
    prevPendingRef.current = pending;
  }, [pending, onFinish]);

  return (
    <Button
      type="submit"
      className={cn("flex items-center", className)}
      disabled={pending}
    >
      {pending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <Spinner size="sm" />
        </motion.div>
      )}

      <motion.span
        layout="position"
        className="select-none"
        style={{
          originY: "0px",
        }}
      >
        {(pending && pendingLabel) || children}
      </motion.span>
    </Button>
  );
}

export default SubmitButton;
