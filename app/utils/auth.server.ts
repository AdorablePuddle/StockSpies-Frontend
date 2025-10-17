import { createCookie, redirect } from "react-router";

const isProduction = process.env.NODE_ENV === "production";

export const AUTH_COOKIE_NAME = "login_token";

export const authCookie = createCookie(AUTH_COOKIE_NAME, {
  path: "/",
  sameSite: "lax",
  secure: isProduction,
});

export function extractAuthToken(payload: unknown): string | null {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (payload && typeof payload === "object") {
    const candidateKeys = ["token", "accessToken", "access_token", "jwt", "jwtToken"];
    for (const key of candidateKeys) {
      const value = (payload as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
  }

  return null;
}

export async function getAuthToken(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const value = await authCookie.parse(cookieHeader);
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export async function requireAuth(request: Request): Promise<string> {
  const token = await getAuthToken(request);
  if (!token) {
    throw redirect("/login");
  }
  return token;
}

export async function commitAuthToken(token: string): Promise<string> {
  return authCookie.serialize(token);
}

export async function destroyAuthToken(): Promise<string> {
  return authCookie.serialize("", { maxAge: 0 });
}
