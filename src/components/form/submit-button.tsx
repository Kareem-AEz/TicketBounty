"use client";

import { motion } from "motion/react";
import React, { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Spinner from "../spinner";
import { Button } from "../ui/button";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  onSubmit?: () => void;
};

function SubmitButton({
  children,
  className,
  pendingLabel,
  onSubmit,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const prevPendingRef = useRef(pending);

  useEffect(() => {
    // If pending was true and is now false, submission finished
    if (prevPendingRef.current && !pending) {
      onSubmit?.();
    }
    prevPendingRef.current = pending;
  }, [pending, onSubmit]);

  return (
    <Button type="submit" className={className} disabled={pending}>
      <div className="flex items-center">
        {pending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Spinner size="sm" className="mr-2" />
          </motion.div>
        )}

        <motion.span layout="position">
          {(pending && pendingLabel) || children}
        </motion.span>
      </div>
    </Button>
  );
}

export default SubmitButton;
