/**
 * SONNER CONTEXT PATCH
 * --------------------
 * Inspired by the ID reconciliation pattern from @bossadizenith.
 *
 * Problem: Standard ID reconciliation in Sonner can lead to "Ghost Timers"
 * (timers not resetting on repeat calls) and glitchy context switching.
 *
 * Solution: This patch enforces a singleton state and uses the Sonner "id"
 * property to force internal reconciliation and timer resets.
 *
 * Try it here: https://patched-sonner.vercel.app/
 */

import { useTheme } from "next-themes";
import React, { useCallback, useMemo } from "react";
import { ExternalToast, toast } from "sonner";

/**
 * Global state for true Singleton behavior.
 * This ensures we track exactly ONE active toast at a time across the app,
 * preventing 'Ghost Timers' and UI desync during rapid interaction.
 */
let activeToastKey = "";
let lastToastId: string | number | undefined;

export function usePatchedToast() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const borderColor = isDarkMode
    ? "oklch(70.4% 0.191 22.216/0.5)"
    : "oklch(0.577 0.245 27.325 / 0.5)";

  const createToast = useCallback(
    (
      method: "default" | "success" | "error" | "info" | "warning" | "loading",
      message: string | React.ReactNode,
      data: ExternalToast & { key?: string; toastOptions?: ExternalToast } = {},
    ) => {
      const { key, toastOptions, ...rest } = data;
      const options = { ...toastOptions, ...rest };

      // 1. Generate a stable, unique key based on message content or a custom key.
      const uniqueKey = `${key ?? ""}-${message}`;
      const toastKey = `toast-key-${btoa(uniqueKey).replace(/[+/=]/g, (m) => ({ "+": "-", "/": "_", "=": "" })[m] ?? "")}`;

      const toastFn = method === "default" ? toast : toast[method];

      // 2. [SMART RESET] If the toast is already active, we don't just animate it;
      // we pass the existing 'id' back to Sonner to force an internal timer reset.
      if (activeToastKey === toastKey && lastToastId !== undefined) {
        toastFn(message, {
          id: lastToastId,
          className: `${toastKey} tid-${lastToastId} ${options.className || ""}`,
          position: "bottom-right",
          ...options,
        });

        // 3. [POLISH] Custom shake animation with OKLCH border-glow.
        // We use a micro-task (setTimeout 0) to ensure the DOM is ready for the animation.
        setTimeout(() => {
          const targetToast = document.querySelector(`.tid-${lastToastId}`);
          if (targetToast) {
            targetToast.animate(
              [
                { translate: "0px", borderColor: "inherit" },
                {
                  translate: "-4px",
                  borderColor,
                },
                {
                  translate: "3px",
                  borderColor,
                },
                {
                  translate: "-2px",
                  borderColor,
                },
                {
                  translate: "1px",
                  borderColor,
                },
                { translate: "0px", borderColor: "inherit" },
              ],
              {
                duration: 470,
                easing: "cubic-bezier(0.25, 1, 0.5, 1)",
              },
            );
          }
        }, 0);

        return lastToastId;
      }

      // 4. [CONTEXT SWITCHING] If a new toast is called (A -> B), we generate a fresh ID.
      // This ensures that clicking 'A' again after 'B' correctly refreshes the UI
      // instead of trying to animate a buried or inactive toast.
      const id = Math.random().toString(36).slice(2, 9);

      toastFn(message, {
        id,
        className: `${toastKey} tid-${id} ${options.className || ""}`,
        position: "bottom-right",
        onAutoClose(t) {
          if (lastToastId === id) {
            activeToastKey = "";
            lastToastId = undefined;
          }
          options.onAutoClose?.(t);
        },
        onDismiss(t) {
          if (lastToastId === id) {
            activeToastKey = "";
            lastToastId = undefined;
          }
          options.onDismiss?.(t);
        },
        ...options,
      });

      // Update singleton state
      activeToastKey = toastKey;
      lastToastId = id;
      return id;
    },
    [borderColor],
  );

  const toastObject = useMemo(() => {
    const baseToast = (
      message: string | React.ReactNode,
      data?: ExternalToast & { key?: string; toastOptions?: ExternalToast },
    ) => createToast("default", message, data);

    return Object.assign(baseToast, {
      success: (
        message: string | React.ReactNode,
        data?: ExternalToast & { key?: string; toastOptions?: ExternalToast },
      ) => createToast("success", message, data),
      error: (
        message: string | React.ReactNode,
        data?: ExternalToast & { key?: string; toastOptions?: ExternalToast },
      ) => createToast("error", message, data),
      info: (
        message: string | React.ReactNode,
        data?: ExternalToast & { key?: string; toastOptions?: ExternalToast },
      ) => createToast("info", message, data),
      warning: (
        message: string | React.ReactNode,
        data?: ExternalToast & { key?: string; toastOptions?: ExternalToast },
      ) => createToast("warning", message, data),
      loading: (
        message: string | React.ReactNode,
        data?: ExternalToast & { key?: string; toastOptions?: ExternalToast },
      ) => createToast("loading", message, data),
      message: (
        message: string | React.ReactNode,
        data?: ExternalToast & { key?: string; toastOptions?: ExternalToast },
      ) => createToast("default", message, data),
      promise: toast.promise,
      custom: toast.custom,
      dismiss: toast.dismiss,
    });
  }, [createToast]);

  return { toast: toastObject };
}
