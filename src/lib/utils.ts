import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TRANSITION_CONFIG } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStaggeredDelay({
  index,
  delay = TRANSITION_CONFIG.baseDelay,
}: {
  index: number;
  delay?: number;
}) {
  return {
    transitionDelay: `${index * delay}ms`,
  };
}
