import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TRANSITION_CONFIG } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStaggeredStyle(index: number) {
  return {
    transitionDelay: `${index * TRANSITION_CONFIG.baseDelay}ms`,
    transitionDuration: TRANSITION_CONFIG.duration,
    transitionTimingFunction: TRANSITION_CONFIG.easing,
  };
}
