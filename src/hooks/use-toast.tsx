import { useCallback } from "react";
import { toast } from "sonner";

const activeToasts = new Map<string, string>();

export function useToast() {
  const showToast = useCallback(
    (message: string, params?: { key?: string }) => {
      const uniqueKey = `${params?.key ?? ""}-${message}`;
      const toastKey = `toast-${btoa(uniqueKey).slice(0, 16)}`;

      if (activeToasts.has(toastKey)) {
        document
          .querySelector(`.${toastKey}`)
          ?.animate(
            [
              { transform: "scale(1)" },
              { transform: "scale(0.95)" },
              { transform: "scale(1.02)" },
              { transform: "scale(1)" },
            ],
            { duration: 300, easing: "ease" },
          );
        return;
      }

      const id = toast(message, {
        className: toastKey,
        duration: 4000,
        onDismiss: () => activeToasts.delete(toastKey),
        onAutoClose: () => activeToasts.delete(toastKey),
      });

      activeToasts.set(toastKey, id.toString());
    },
    [],
  );

  return { toast: showToast };
}
