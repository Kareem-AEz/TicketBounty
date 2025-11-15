export const getBaseUrl = () => {
  // In Vercel: use VERCEL_ENV for accurate environment detection
  // NODE_ENV may not reflect preview vs production correctly
  if (process.env.VERCEL_ENV === "production") {
    // Replace with your production domain if you have a custom one
    return (
      process.env.PRODUCTION_URL ||
      `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    );
  }

  // Preview and development deployments use Vercel URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Local development
  return "http://localhost:3000";
};
