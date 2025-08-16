import { useEffect, useRef } from "react";

type KeyDownOptions = {
  /**
   * Whether the hook should be active
   * @default true
   */
  enabled?: boolean;
  /**
   * Prevent default behavior when key combination is detected
   * @default true
   */
  preventDefault?: boolean;
  /**
   * Target element to attach listener to
   * @default document
   */
  target?: EventTarget | null;
  /**
   * Whether to disable shortcuts when input elements are focused
   * @default true
   */
  disableOnInput?: boolean;
};

type KeyCombination = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

/**
 * Elegant hook for detecting keyboard combinations
 *
 * @example
 * // Simple key detection
 * useKeyDown('Escape', () => closeModal());
 *
 * @example
 * // Key combination with modifiers
 * useKeyDown({ key: 'd', ctrl: true }, () => deleteItem());
 *
 * @example
 * // Multiple key combinations
 * useKeyDown([
 *   { key: 's', ctrl: true },
 *   { key: 's', meta: true }
 * ], () => saveDocument());
 *
 * @example
 * // Conditional activation
 * useKeyDown('Delete', handleDelete, { enabled: isEditMode });
 *
 * @example
 * // Allow shortcuts even when typing in inputs
 * useKeyDown({ key: 's', ctrl: true }, saveFile, { disableOnInput: false });
 */
/**
 * Helper function to check if an element is an input-like element
 */
const isInputElement = (element: Element | null): boolean => {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const isInput = tagName === "input" || tagName === "textarea";
  const isContentEditable = element.getAttribute("contenteditable") === "true";

  return isInput || isContentEditable;
};

export function useKeyDown(
  keys: string | KeyCombination | (string | KeyCombination)[],
  callback: (event: KeyboardEvent) => void,
  options: KeyDownOptions = {},
) {
  const {
    enabled = true,
    preventDefault = true,
    target = typeof document !== "undefined" ? document : null,
    disableOnInput = true,
  } = options;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || !target) return;

    const normalizedKeys = Array.isArray(keys) ? keys : [keys];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if input elements are focused and disableOnInput is true
      if (disableOnInput && isInputElement(event.target as Element)) {
        return;
      }

      const matches = normalizedKeys.some((keyPattern) => {
        if (typeof keyPattern === "string") {
          return event.key === keyPattern;
        }

        const {
          key,
          ctrl = false,
          shift = false,
          alt = false,
          meta = false,
        } = keyPattern;

        return (
          event.key.toLowerCase() === key.toLowerCase() &&
          event.ctrlKey === ctrl &&
          event.shiftKey === shift &&
          event.altKey === alt &&
          event.metaKey === meta
        );
      });

      if (matches) {
        if (preventDefault) {
          event.preventDefault();
        }
        callbackRef.current(event);
      }
    };

    target.addEventListener("keydown", handleKeyDown as EventListener);

    return () => {
      target.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [keys, enabled, preventDefault, target, disableOnInput]);
}

/**
 * Common keyboard shortcuts for convenience
 */
export const shortcuts = {
  save: [
    { key: "s", ctrl: true },
    { key: "s", meta: true },
  ],
  delete: [
    { key: "d", ctrl: true },
    { key: "d", meta: true },
  ],
  escape: "Escape",
  enter: "Enter",
  backspace: "Backspace",
  copy: [
    { key: "c", ctrl: true },
    { key: "c", meta: true },
  ],
  paste: [
    { key: "v", ctrl: true },
    { key: "v", meta: true },
  ],
} as const;
