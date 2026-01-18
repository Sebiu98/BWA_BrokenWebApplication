"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useAuth } from "../../hooks/useAuth";

type AuthMode = "login" | "register";

const AuthForm = ({ mode }: { mode: AuthMode }) => {
  const router = useRouter();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    if (mode === "login") {
      await login({ email, password });
    } else {
      await register({ email, password });
    }

    router.push("/");
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </label>

        <Button type="submit" className="w-full">
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
