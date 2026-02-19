import { useCallback } from "react";
import { toast } from "sonner";

let activeToasts = "";
let lastToastId: string | number | undefined;

export function useToast() {
  const showToast = useCallback(
    (message: string | React.ReactNode, params?: { key?: string }) => {
      // Create a stable key and sanitize it for CSS class compatibility
      const uniqueKey = `${params?.key ?? ""}-${message}`;
      const toastKey = `tkey-${btoa(encodeURIComponent(uniqueKey))}`;

      if (activeToasts === toastKey && lastToastId !== undefined) {
        toast(message, {
          id: lastToastId,
          className: `${toastKey} tid-${lastToastId}`,
          duration: 4000,
        });

        // Use a small timeout to ensure sonner has updated the DOM before selecting
        const target = document.querySelector(
          `.tid-${lastToastId}`,
        ) as HTMLElement;
        if (target) {
          target.animate(
            [
              { transform: "translateX(0px)" },
              { transform: "translateX(-5px)" },
              { transform: "translateX(10px)" },
              { transform: "translateX(0px)" },
            ],
            { duration: 276, easing: "ease-out" },
          );
        }
        return;
      }

      // Generate a unique ID for this instance to prevent dismissal collisions
      const id = Math.random().toString(36).slice(2, 9);
      toast(message, {
        id,
        className: `${toastKey} tid-${id}`,
        duration: 4000,
        onDismiss: () => {
          if (lastToastId === id) {
            activeToasts = "";
            lastToastId = undefined;
          }
        },
        onAutoClose: () => {
          if (lastToastId === id) {
            activeToasts = "";
            lastToastId = undefined;
          }
        },
      });

      activeToasts = toastKey;
      lastToastId = id;
    },
    [],
  );

  return { toast: showToast };
}
