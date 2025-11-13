export const getBaseUrl = () => {
  const env = process.env.NODE_ENV;

  const baseUrl =
    env === "development"
      ? "http://localhost:3000"
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  return baseUrl;
};
