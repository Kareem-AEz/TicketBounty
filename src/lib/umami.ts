/**
 * Umami Analytics Utilities
 *
 * This module provides TypeScript-safe wrappers for Umami analytics functions.
 * Umami is a privacy-friendly, open-source alternative to Google Analytics.
 *
 * @see https://umami.is/docs
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Extend the global Window interface to include Umami's global object.
 *
 * The Umami script (loaded via <Script> tag in layout.tsx) adds a global
 * `umami` object to the window. This declaration tells TypeScript about it.
 */
declare global {
  interface Window {
    umami?: {
      /**
       * Track pageviews or custom events
       *
       * @param eventOrPayload - Event name (string) or custom payload (object)
       * @param data - Optional event data (key-value pairs)
       */
      track: (
        eventOrPayload?:
          | string
          | object
          | ((props: Record<string, unknown>) => Record<string, unknown>),
        data?: object,
      ) => void;

      /**
       * Identify a user session with a unique ID and optional properties
       *
       * @param idOrData - User ID (string) or data object
       * @param data - Optional user properties
       */
      identify: (idOrData?: string | object, data?: object) => void;
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Track a custom event with optional data
 *
 * Use this to programmatically track user actions that aren't covered by
 * data-umami-event attributes (e.g., complex interactions, API responses).
 *
 * @param eventName - Descriptive name for the event (e.g., "ticket-create")
 * @param data - Optional metadata about the event (key-value pairs)
 *
 * @example
 * // Track a simple event
 * trackEvent('button-click');
 *
 * @example
 * // Track an event with metadata
 * trackEvent('ticket-create', {
 *   status: 'open',
 *   has_bounty: true,
 *   bounty_amount: 50
 * });
 *
 * @example
 * // Track a search query
 * trackEvent('search', {
 *   query: searchTerm,
 *   results_count: results.length,
 *   filter_active: hasFilters
 * });
 *
 * @example
 * // Track an API error
 * trackEvent('api-error', {
 *   endpoint: '/api/tickets',
 *   status_code: 500,
 *   error_message: error.message
 * });
 */
export const trackEvent = (eventName: string, data?: object) => {
  // Guard: Only run in browser (not during SSR)
  // Guard: Only run if Umami script has loaded
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(eventName, data);
  }
};

/**
 * Identify a user with a unique ID and optional properties
 *
 * This links all future events to a specific user, enabling user-level analytics:
 * - User journey tracking (sign-up → first ticket → engagement)
 * - Retention analysis (did user return after 7 days?)
 * - User segmentation (power users vs casual users)
 *
 * Call this after successful sign-in/sign-up or when detecting an existing session.
 *
 * @param userId - Unique identifier for the user (e.g., database user.id)
 * @param data - Optional user properties (username, email, plan, etc.)
 *
 * @example
 * // Simple identification (just user ID)
 * identifyUser('user-123');
 *
 * @example
 * // Identification with user properties
 * identifyUser('user-123', {
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   account_type: 'premium',
 *   signup_date: '2024-01-15'
 * });
 *
 * @example
 * // After successful sign-in
 * const handleSignIn = async () => {
 *   const user = await signIn(credentials);
 *   identifyUser(user.id, {
 *     username: user.username,
 *     session_start: new Date().toISOString()
 *   });
 * };
 *
 * @example
 * // Track user updates
 * const handleUpgrade = async () => {
 *   await upgradeToPremium();
 *   identifyUser(user.id, {
 *     plan: 'premium',
 *     upgraded_at: new Date().toISOString()
 *   });
 * };
 */
export const identifyUser = (userId: string, data?: object) => {
  // Guard: Only run in browser (not during SSR)
  // Guard: Only run if Umami script has loaded
  if (typeof window !== "undefined" && window.umami) {
    window.umami.identify(userId, data);
  }
};

/**
 * Disable tracking for localhost/development environments
 *
 * This prevents your development/testing activity from polluting production analytics.
 * Call this once on app initialization (e.g., in a useEffect in your root layout).
 *
 * The function stores a flag in localStorage that Umami checks before tracking.
 *
 * @example
 * // In a client component (like AnalyticsTracker)
 * useEffect(() => {
 *   disableAnalyticsForLocalhost();
 * }, []);
 *
 * @example
 * // Manually disable analytics for a specific user (e.g., admin)
 * if (user.role === 'admin') {
 *   localStorage.setItem('umami.disabled', '1');
 * }
 *
 * @example
 * // Re-enable analytics (for testing)
 * localStorage.removeItem('umami.disabled');
 *
 * @note
 * Only disables for localhost and 127.0.0.1. Production domains are unaffected.
 */
export const disableAnalyticsForLocalhost = () => {
  // Guard: Only run in browser (not during SSR)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // Disable tracking for local development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      localStorage.setItem("umami.disabled", "1");
    }
  }
};

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * HOW TO USE THESE UTILITIES:
 *
 * 1. HTML DATA ATTRIBUTES (Recommended for clicks/submits):
 *    <button data-umami-event="sign-up-click">Sign Up</button>
 *    <button data-umami-event="ticket-create" data-umami-event-status="open">
 *      Create Ticket
 *    </button>
 *
 * 2. PROGRAMMATIC TRACKING (For dynamic events):
 *    import { trackEvent } from '@/lib/umami';
 *
 *    const handleSearch = (query) => {
 *      const results = await search(query);
 *      trackEvent('search', {
 *        query,
 *        results_count: results.length
 *      });
 *    };
 *
 * 3. USER IDENTIFICATION (Once per session):
 *    import { identifyUser } from '@/lib/umami';
 *
 *    // In sign-in success handler
 *    identifyUser(user.id, { username: user.username });
 *
 * 4. LOCALHOST EXCLUSION (Once on app load):
 *    import { disableAnalyticsForLocalhost } from '@/lib/umami';
 *
 *    useEffect(() => {
 *      disableAnalyticsForLocalhost();
 *    }, []);
 *
 * BEST PRACTICES:
 * - Use data attributes for simple click tracking
 * - Use trackEvent() for complex/conditional events
 * - Call identifyUser() after authentication
 * - Keep event names consistent (use kebab-case)
 * - Limit data properties to essential metrics
 * - Don't track sensitive data (passwords, tokens, etc.)
 */
