import "server-only";
import { cookies } from "next/headers";

const COOKIE = "tp_admin_token";
const MAX_AGE = 60 * 60 * 8; // 8 hours

/** The Laravel-issued admin Bearer token, stored httpOnly so it's off-limits to JS. */
export async function getAdminToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

export async function setAdminToken(token: string): Promise<void> {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminToken(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
