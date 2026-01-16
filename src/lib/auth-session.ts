export type UserRole = "user" | "admin";

export type AuthUser = {
  email: string;
  role: UserRole;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const STORAGE_KEY = "bwa_auth_session";

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user?.email || !parsed?.user?.role) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  // TODO: sostituire con JWT reale firmato dal backend e salvarlo in cookie httpOnly.
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
