"use client";

import { useEffect, useState } from "react";
import {
  type AuthSession,
  type UserRole,
  clearSession,
  readSession,
  writeSession,
} from "../lib/auth-session";
import { mockUsers } from "../data/users";

//Credenziali base usate nel form.
export type AuthCredentials = {
  email: string;
  password: string;
};

//Hook semplice per gestire la sessione demo.
export function useAuth() {
  //Sessione attuale letta dal browser.
  const [session, setSession] = useState<AuthSession | null>(null);
  //Flag per capire se il client ha gia letto lo storage.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    //Carica la sessione al primo mount.
    const storedSession = readSession();
    setSession(storedSession);
    setIsReady(true);
    //Ascolta cambi di sessione (login/logout) senza refresh.
    const handleAuthChange = () => {
      const nextSession = readSession();
      setSession(nextSession);
    };
    window.addEventListener("bwa-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("bwa-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const login = async ({ email, password }: AuthCredentials) => {
    //TODO:chiamare endpoint /auth/login, validare credenziali e ricevere JWT.
    //TODO:gestire errori dal backend (utente non valido, password errata).
    //Verifica credenziali in locale usando gli utenti mock.
    const matchedUser = mockUsers.find((user) => {
      return user.email === email && user.password === password;
    });

    if (!matchedUser) {
      //Messaggio semplice per credenziali errate.
      alert("Invalid credentials.");
      return;
    }

    void password;
    const nextSession: AuthSession = {
      token: "demo-jwt-token",
      user: {
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role,
      },
    };
    writeSession(nextSession);
    setSession(nextSession);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("bwa-auth-change"));
    }
  };

  const register = async ({ email, password }: AuthCredentials) => {
    //TODO:inviare registrazione al backend e salvare su Postgres.
    //TODO:hash password sul backend (bcrypt) prima di salvare.
    //TODO:assegnare ruolo "admin" in base agli account configurati dal backend/JWT.
    //Nome semplice ricavato dall'email (mock).
    void password;
    const name = email.split("@")[0] || "New user";
    const nextSession: AuthSession = {
      token: "demo-jwt-token",
      user: { email, name, role: "user" },
    };
    writeSession(nextSession);
    setSession(nextSession);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("bwa-auth-change"));
    }
  };

  const logout = () => {
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

  return { user, session, isAuthenticated, isAdmin, isReady, login, register, logout };
}
