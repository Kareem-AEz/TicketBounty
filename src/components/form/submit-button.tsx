"use client";

import { motion } from "motion/react";
import React, { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import Spinner from "../spinner";
import { Button } from "../ui/button";

type SubmitButtonProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  onFinish?: () => void;
  pending?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

function SubmitButton({
  icon,
  children,
  className,
  pendingLabel,
  onFinish,
  pending,
  variant,
  size,
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const isWorking = formPending || pending;
  const prevPendingRef = useRef(isWorking);

  useEffect(() => {
    // If pending was true and is now false, submission finished
    if (prevPendingRef.current && !isWorking) {
      onFinish?.();
    }
    prevPendingRef.current = isWorking;
  }, [isWorking, onFinish]);

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={cn("flex items-center", className)}
      disabled={isWorking}
    >
      {isWorking && (
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
        className="flex items-center gap-2 select-none"
        style={{
          originY: "0px",
        }}
      >
        {icon}
        {(isWorking && pendingLabel) || children}
      </motion.span>
    </Button>
  );
}

export default SubmitButton;
