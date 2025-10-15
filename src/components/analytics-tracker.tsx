"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { disableAnalyticsForLocalhost, identifyUser } from "@/lib/umami";

/**
 * Analytics Tracker Component
 *
 * This is a global, invisible component that handles automatic analytics setup.
 * It should be mounted once in the root layout to ensure analytics work properly.
 *
 * RESPONSIBILITIES:
 * 1. Disables analytics for localhost/development environments
 * 2. Automatically identifies authenticated users for session tracking
 * 3. Updates user identity when authentication state changes
 *
 * HOW IT WORKS:
 * - Runs two useEffect hooks on mount and when auth state changes
 * - First effect: Checks hostname and disables analytics for local dev
 * - Second effect: When user is authenticated, calls Umami's identify function
 *
 * WHAT GETS TRACKED:
 * - user.id: Unique identifier for cross-session tracking
 * - username: Human-readable identifier
 * - email: User's email address
 * - session_start: Timestamp when this session began
 *
 * @example
 * // In your root layout (already implemented in src/app/layout.tsx):
 * // import AnalyticsTracker from "@/components/analytics-tracker";
 * //
 * // export default function RootLayout({ children }) {
 * //   return (
 * //     <ReactQueryProvider>
 * //       <AnalyticsTracker />
 * //       {children}
 * //     </ReactQueryProvider>
 * //   );
 * // }
 *
 * @returns null - This component doesn't render any UI
 */
export default function AnalyticsTracker() {
  // Get current user's authentication state
  // - user: User object if authenticated, null otherwise
  // - isFetched: Boolean indicating if auth check is complete
  const { user, isFetched } = useAuth();

  // ============================================================================
  // EFFECT 1: Disable Analytics for Development
  // ============================================================================

  /**
   * Runs once on component mount to disable analytics on localhost.
   *
   * WHY THIS MATTERS:
   * - Prevents your dev/testing activity from skewing production analytics
   * - Keeps analytics data clean and accurate
   * - Avoids inflating event counts during development
   *
   * HOW IT WORKS:
   * - Checks window.location.hostname
   * - If localhost or 127.0.0.1, sets localStorage flag
   * - Umami checks this flag before tracking events
   *
   * WHEN IT RUNS:
   * - Once when component mounts (empty dependency array)
   * - Won't run again unless component unmounts/remounts
   */
  useEffect(() => {
    disableAnalyticsForLocalhost();
  }, []); // Empty deps = run once on mount

  // ============================================================================
  // EFFECT 2: Identify Authenticated Users
  // ============================================================================

  /**
   * Runs whenever authentication state changes to identify the user.
   *
   * WHY THIS MATTERS:
   * - Links all future events to a specific user
   * - Enables user journey tracking (sign-up → first ticket → retention)
   * - Allows analyzing behavior patterns per user
   * - Supports cohort analysis and retention metrics
   *
   * HOW IT WORKS:
   * - Waits for auth check to complete (isFetched)
   * - If user is authenticated, calls umami.identify()
   * - Passes user ID and properties to Umami
   *
   * WHEN IT RUNS:
   * - When user signs in (user changes from null → user object)
   * - When user signs out (user changes from user object → null)
   * - When page loads with existing session (isFetched becomes true)
   *
   * WHAT GETS SENT TO UMAMI:
   * - User ID: Unique identifier for cross-session tracking
   * - Username: Human-readable name for filtering/segmentation
   * - Email: User's email address for support/debugging
   * - Session Start: ISO timestamp of when this session began
   *
   * @example
   * // What this does behind the scenes:
   * // umami.identify('user-abc-123', {
   * //   username: 'john_doe',
   * //   email: 'john@example.com',
   * //   session_start: '2024-01-15T10:30:00.000Z'
   * // });
   */
  useEffect(() => {
    // Only proceed if:
    // 1. Auth check is complete (isFetched = true)
    // 2. User is authenticated (user is not null)
    if (isFetched && user) {
      identifyUser(user.id, {
        username: user.username,
        session_start: new Date().toISOString(),
      });

      // FUTURE ENHANCEMENTS YOU COULD ADD:
      // - Track user role/permissions
      // - Track account creation date
      // - Track subscription/plan type
      // - Track user preferences
      //
      // Example:
      // identifyUser(user.id, {
      //   username: user.username,
      //   email: user.email,
      //   role: user.role,
      //   plan: user.plan,
      //   created_at: user.createdAt,
      //   session_start: new Date().toISOString(),
      // });
    }
  }, [user, isFetched]); // Re-run when auth state changes

  // ============================================================================
  // RENDER
  // ============================================================================

  /**
   * This component doesn't render any UI.
   * It only sets up analytics tracking via side effects (useEffect).
   *
   * Returning null is a React pattern for "logic-only" components.
   */
  return null;
}

// ============================================================================
// ADDITIONAL USAGE EXAMPLES
// ============================================================================

/**
 * HOW TO EXTEND THIS COMPONENT:
 *
 * 1. TRACK PAGE VIEWS AUTOMATICALLY:
 *    ```tsx
 *    const pathname = usePathname();
 *    useEffect(() => {
 *      trackEvent('page-view', { path: pathname });
 *    }, [pathname]);
 *    ```
 *
 * 2. TRACK TIME ON PAGE:
 *    ```tsx
 *    useEffect(() => {
 *      const startTime = Date.now();
 *      return () => {
 *        const duration = Date.now() - startTime;
 *        trackEvent('page-exit', { duration_seconds: duration / 1000 });
 *      };
 *    }, []);
 *    ```
 *
 * 3. TRACK NETWORK STATUS:
 *    ```tsx
 *    useEffect(() => {
 *      const handleOffline = () => trackEvent('network-offline');
 *      const handleOnline = () => trackEvent('network-online');
 *
 *      window.addEventListener('offline', handleOffline);
 *      window.addEventListener('online', handleOnline);
 *
 *      return () => {
 *        window.removeEventListener('offline', handleOffline);
 *        window.removeEventListener('online', handleOnline);
 *      };
 *    }, []);
 *    ```
 *
 * 4. TRACK USER PREFERENCES:
 *    ```tsx
 *    const { theme } = useTheme();
 *    useEffect(() => {
 *      if (user) {
 *        trackEvent('theme-change', { theme });
 *      }
 *    }, [theme, user]);
 *    ```
 */
