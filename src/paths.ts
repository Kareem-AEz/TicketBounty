export const homePath = () => "/" as const;
export const ticketsPath = () => "/tickets" as const;
export const ticketPath = (ticketId: string) => `/tickets/${ticketId}` as const;

export const signInPath = () => "/sign-in" as const;
export const signUpPath = () => "/sign-up" as const;
export const passwordForgotPath = () => "/password-forgot" as const;
export const passwordResetPath = (tokenId: string) =>
  `/password-reset/${tokenId}` as const;
export const emailVerificationPath = (tokenId: string) =>
  `/email-verification/${tokenId}` as const;

export const accountPath = () => "/account" as const;
export const accountProfilePath = () => "/account/profile" as const;
export const accountPasswordPath = () => "/account/password" as const;
