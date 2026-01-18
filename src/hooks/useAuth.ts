"use client";

import { useEffect, useState } from "react";
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
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedSession = readSession();
    setSession(storedSession);
    setIsReady(true);
  }, []);

  const login = async ({ email, password }: AuthCredentials) => {
    // TODO: chiamare endpoint /auth/login, validare credenziali e ricevere JWT.
    // TODO: gestire errori dal backend (utente non valido, password errata).
    void password;
    const nextSession: AuthSession = {
      token: "demo-jwt-token",
      user: { email, role: "user" },
    };
    writeSession(nextSession);
    setSession(nextSession);
  };

  const register = async ({ email, password }: AuthCredentials) => {
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
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(session);
  const isAdmin = user?.role === "admin";

  return { user, session, isAuthenticated, isAdmin, isReady, login, register, logout };
}
