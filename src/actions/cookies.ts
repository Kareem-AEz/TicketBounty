"use server";

import { cookies } from "next/headers";

export async function setCookie(key: string, value: string) {
  (await cookies()).set(key, value);
}

export async function getCookie(key: string) {
  const cookie = (await cookies()).get(key);
  if (!cookie) return null;
  return cookie.value;
}

export async function deleteCookie(key: string) {
  (await cookies()).delete(key);
}
