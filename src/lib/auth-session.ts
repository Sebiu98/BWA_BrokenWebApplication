//Tipi base per la sessione demo.
export type UserRole = "user" | "admin";

//Utente salvato nella sessione.
export type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
};

//Sessione completa salvata in localStorage.
export type AuthSession = {
  token: string;
  user: AuthUser;
};

//Chiave usata in localStorage.
const STORAGE_KEY = "bwa_auth_session";

//Legge la sessione dal browser (solo client).
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
    if (
      !parsed?.token ||
      !parsed?.user?.name ||
      !parsed?.user?.email ||
      !parsed?.user?.role
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

//Scrive la sessione demo.
export function writeSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  //TODO:sostituire con JWT reale firmato dal backend e salvarlo in cookie httpOnly.
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

//Pulisce la sessione demo.
export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
