import { useQuery } from "@tanstack/react-query";
import { getAuthOrRedirect } from "./get-auth-or-redirect";

export const useAuthQuery = () => {
  return useQuery({
    queryKey: ["auth", "guard"],
    queryFn: () => getAuthOrRedirect(), // Let redirect errors bubble up naturally
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry redirect errors
  });
};

// Check if error is a Next.js redirect
export function isRedirectError(
  error: unknown,
): error is Error & { digest: string } {
  if (typeof error !== "object" || error === null) return false;
  return (
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

// Extract redirect URL from Next.js redirect error
// Format: "NEXT_REDIRECT;replace;url" or "NEXT_REDIRECT;push;url"
export function getRedirectUrl(error: unknown): string | null {
  if (!isRedirectError(error)) return null;

  const digest = error.digest;
  // Next.js redirect digest format: "NEXT_REDIRECT;replace;url" or "NEXT_REDIRECT;push;url"
  const parts = digest.split(";");
  if (parts.length >= 3) {
    return parts[2];
  }
  return null;
}
