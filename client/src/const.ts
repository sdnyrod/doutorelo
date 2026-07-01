export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const PENDING_AUTH_RETURN_PATH_KEY = "doutorelo-pending-auth-return-path-v1";

const normalizeReturnPath = (returnPath?: string) => {
  if (!returnPath || returnPath === "/") return undefined;
  if (!returnPath.startsWith("/")) return undefined;
  if (returnPath.startsWith("//")) return undefined;
  if (returnPath.startsWith("/api/")) return undefined;
  return returnPath;
};

export const getLoginUrl = (returnPath?: string) => {
  const safeReturnPath = normalizeReturnPath(returnPath);
  if (safeReturnPath && typeof window !== "undefined") {
    window.sessionStorage.setItem(PENDING_AUTH_RETURN_PATH_KEY, safeReturnPath);
  }

  const params = new URLSearchParams();
  if (safeReturnPath) params.set("next", safeReturnPath);
  return `/login${params.toString() ? `?${params.toString()}` : ""}`;
};

const buildOAuthLoginUrl = (returnPath?: string) => {
  const safeReturnPath = normalizeReturnPath(returnPath);
  if (safeReturnPath && typeof window !== "undefined") {
    window.sessionStorage.setItem(PENDING_AUTH_RETURN_PATH_KEY, safeReturnPath);
  }

  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

export const getOAuthLoginUrl = buildOAuthLoginUrl;
export const getDoutoreloAuthHandoffUrl = buildOAuthLoginUrl;
