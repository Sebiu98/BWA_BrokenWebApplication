"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type AuthSession,
  type UserRole,
  clearSession,
  readSession,
  writeSession,
} from "../lib/auth-session";

export type AuthCredentials = {
  email: string;
  password: string;
};

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
  }, []);

  const login = useCallback(async ({ email, password }: AuthCredentials) => {
    // TODO: chiamare endpoint /auth/login, validare credenziali e ricevere JWT.
    // TODO: gestire errori dal backend (utente non valido, password errata).
    void password;
    const nextSession: AuthSession = {
      token: "demo-jwt-token",
      user: { email, role: "user" },
    };
    writeSession(nextSession);
    setSession(nextSession);
  }, []);

  const register = useCallback(async ({ email, password }: AuthCredentials) => {
    // TODO: inviare registrazione al backend e salvare su Postgres.
    // TODO: hash password sul backend (bcrypt) prima di salvare.
    // TODO: assegnare ruolo "admin" in base agli account configurati dal backend/JWT.
    void password;
    const nextSession: AuthSession = {
      token: "demo-jwt-token",
      user: { email, role: "user" },
    };
    writeSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(session);
  const isAdmin = user?.role === "admin";

  return { user, session, isAuthenticated, isAdmin, isReady, login, register, logout };
}
