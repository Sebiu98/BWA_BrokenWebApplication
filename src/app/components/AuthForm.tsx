"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { useAuth } from "../../hooks/useAuth";

//Modalita del form.
type AuthMode = "login" | "register";

const AuthForm = ({ mode }: { mode: AuthMode }) => {
  //Router per i redirect post login/registrazione.
  const router = useRouter();
  //Legge il parametro next per redirect semplice.
  const searchParams = useSearchParams();
  //Hook auth: chiama API login/register e salva token sessione.
  const { login, register } = useAuth();
  //Stato locale degli input.
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  //Testi base del form.
  let title = "";
  let description = "";
  let submitLabel = "";
  let switchLabel = "";
  let switchText = "";
  let switchHref = "";

  if (mode === "login") {
    title = "Welcome back";
    description = "Sign in to access your library and purchases.";
    submitLabel = "Sign in";
    switchLabel = "Need an account?";
    switchText = "Sign up";
    switchHref = "/register";
  } else {
    title = "Create your account";
    description = "Join BWA to unlock instant delivery and verified keys.";
    submitLabel = "Create account";
    switchLabel = "Already have an account?";
    switchText = "Log in";
    switchHref = "/login";
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    //TODO:vulnerabilita:login senza rate limit per brute force.
    //TODO:vulnerabilita:SQLi nel backend se la query non e parametrizzata.
    //TODO:vulnerabilita:token di sessione prevedibile o non rigenerato.
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        //Controlla username e conferma password.
        const trimmedUsername = username.trim();
        const trimmedName = name.trim();
        const trimmedSurname = surname.trim();
        if (!trimmedUsername) {
          throw new Error("Please enter a username.");
        }
        if (!trimmedName) {
          throw new Error("Please enter your name.");
        }
        if (!trimmedSurname) {
          throw new Error("Please enter your surname.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await register({
          email,
          password,
          username: trimmedUsername,
          name: trimmedName,
          surname: trimmedSurname,
        });
      }

      //Redirect semplice dopo l'azione.
      const nextPath = searchParams.get("next");
      if (nextPath) {
        router.push(nextPath);
      } else {
        router.push("/");
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Authentication failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" ? (
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              type="text"
              required
              autoComplete="given-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </label>
        ) : null}
        {mode === "register" ? (
          <label className="block text-sm font-medium text-slate-700">
            Surname
            <input
              type="text"
              required
              autoComplete="family-name"
              value={surname}
              onChange={(event) => setSurname(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </label>
        ) : null}
        {mode === "register" ? (
          <label className="block text-sm font-medium text-slate-700">
            Username
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </label>
        ) : null}
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </label>
        {mode === "register" ? (
          <label className="block text-sm font-medium text-slate-700">
            Confirm password
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </label>
        ) : null}

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {switchLabel}{" "}
        <Link href={switchHref} className="font-semibold text-slate-900">
          {switchText}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
