"use client";

import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { ShoppingCart } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { useAuth } from "../../hooks/useAuth";

//Navbar principale con stato auth demo.
const Navbar = () => {
  //Dati utente dalla sessione.
  const { user, isAdmin, logout } = useAuth();

  //Struttura navbar con logo, link e azioni.
  return (
    <nav className="sticky z-100 h-16 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between border-b border-zinc-200">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center z-40">
              <Image
                src="/BWA_logo.png"
                alt="BWA logo"
                width={160}
                height={80}
                className="h-16 w-auto"
              />
              <span className="hidden flex-col leading-none text-slate-900 lg:flex">
                <span className="text-xs font-semibold sm:text-sm">
                  Broken Web
                </span>
                <span className="text-xs font-semibold sm:text-sm">
                  Application
                </span>
              </span>
            </Link>
          </div>

          <div className="h-full flex items-center space-x-4">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:block">
                  Hi, {user.name}
                </span>
                <Link
                  href="/profile"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  Sign Out
                </button>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                  >
                    Dashboard
                  </Link>
                ) : null}

                <Link
                  href="/cart"
                  className={buttonVariants({
                    size: "sm",
                    className: "hidden sm:flex items-center gap-1",
                  })}
                >
                  Cart
                  <ShoppingCart className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  Login
                </Link>

                <div className="h-8 w-px bg-zinc-200 sm:block" />
                <Link
                  href="/cart"
                  className={buttonVariants({
                    size: "sm",
                    className: "hidden sm:flex items-center gap-1",
                  })}
                >
                  Cart
                  <ShoppingCart className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
