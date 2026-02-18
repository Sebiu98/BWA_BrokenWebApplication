"use client";

import { useEffect, useState } from "react";
import {
  type AuthUser,
  type AuthSession,
  clearSession,
  readSession,
  writeSession,
} from "../lib/auth-session";
import {
  ApiRequestError,
  loginApiAuth,
  logoutApiAuth,
  meApiAuth,
  registerApiAuth,
} from "../lib/api";

//Credenziali base usate nel form.
export type AuthCredentials = {
  email: string;
  password: string;
  username?: string;
  name?: string;
  surname?: string;
};

const normalizeRole = (role: string): "user" | "admin" => {
  return role === "admin" ? "admin" : "user";
};

const toSessionUser = (input: {
  email: string;
  role: string;
  username?: string;
  name?: string;
}): AuthUser => {
  const displayName =
    input.username || input.name || input.email.split("@")[0] || "User";
  return {
    email: input.email,
    name: displayName,
    role: normalizeRole(input.role),
  };
};

const toAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiRequestError) {
    if (error.errors) {
      const keys = Object.keys(error.errors);
      if (keys.length > 0) {
        const firstField = keys[0];
        const firstError = error.errors[firstField]?.[0];
        if (firstError) {
          return firstError;
        }
      }
    }
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

//Hook semplice per gestire la sessione demo.
export function useAuth() {
  //Sessione attuale letta dal browser.
  const [session, setSession] = useState<AuthSession | null>(null);
  //Flag semplice per la UI.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    //Carica la sessione dopo il primo render per evitare mismatch.
    const timer = window.setTimeout(async () => {
      const storedSession = readSession();

      if (!storedSession) {
        setSession(null);
        setIsReady(true);
        return;
      }

      try {
        const me = await meApiAuth(storedSession.token);
        const refreshedSession: AuthSession = {
          token: storedSession.token,
          user: toSessionUser({
            email: me.email,
            role: me.role,
            username: me.username,
            name: me.name,
          }),
        };
        writeSession(refreshedSession);
        setSession(refreshedSession);
      } catch {
        clearSession();
        setSession(null);
      } finally {
        setIsReady(true);
      }
    }, 0);
    //Ascolta cambi di sessione (login/logout) senza refresh.
    const handleAuthChange = () => {
      const nextSession = readSession();
      setSession(nextSession);
    };
    window.addEventListener("bwa-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("bwa-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const login = async ({ email, password }: AuthCredentials) => {
    try {
      const response = await loginApiAuth({ email, password });
      const nextSession: AuthSession = {
        token: response.token,
        user: toSessionUser({
          email: response.user.email,
          role: response.user.role,
          username: response.user.username,
          name: response.user.name,
        }),
      };
      writeSession(nextSession);
      setSession(nextSession);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("bwa-auth-change"));
      }
    } catch (error) {
      throw new Error(toAuthErrorMessage(error, "Login failed."));
    }
  };

  const register = async ({
    email,
    password,
    username,
    name,
    surname,
  }: AuthCredentials) => {
    if (!username || !name || !surname) {
      throw new Error("Username, name and surname are required.");
    }

    try {
      const response = await registerApiAuth({
        username,
        name,
        surname,
        email,
        password,
      });

      const nextSession: AuthSession = {
        token: response.token,
        user: toSessionUser({
          email: response.user.email,
          role: response.user.role,
          username: response.user.username,
          name: response.user.name,
        }),
      };
      writeSession(nextSession);
      setSession(nextSession);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("bwa-auth-change"));
      }
    } catch (error) {
      throw new Error(toAuthErrorMessage(error, "Registration failed."));
    }
  };

  const logout = async () => {
    const activeToken = session?.token;
    if (activeToken) {
      try {
        await logoutApiAuth(activeToken);
      } catch {
        // Anche se l'API fallisce, chiudiamo la sessione locale.
      }
    }

    //Pulisce la sessione e avvisa gli altri componenti.
    clearSession();
    setSession(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("bwa-auth-change"));
    }
  };

  //Dati di comodo per la UI.
  const user = session?.user ?? null;
  const isAuthenticated = Boolean(session);
  const isAdmin = user?.role === "admin";

  return {
    user,
    session,
    isAuthenticated,
    isAdmin,
    isReady,
    login,
    register,
    logout,
  };
}
