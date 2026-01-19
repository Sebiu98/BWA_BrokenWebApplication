"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  ShoppingBag,
  ShoppingCart,
  User,
  UserPlus,
} from "lucide-react";
import { buttonVariants } from "./ui/button";
import { useAuth } from "../../hooks/useAuth";
import { readCart } from "../../lib/cart-storage";

//Navbar principale con stato auth demo.
const Navbar = () => {
  //Dati utente dalla sessione.
  const { user, isAdmin, logout } = useAuth();
  //Conteggio semplice del carrello.
  const [cartCount, setCartCount] = useState(0);
  const [isCartReady, setIsCartReady] = useState(false);

  useEffect(() => {
    //Carica il carrello dopo il primo render.
    const timer = window.setTimeout(() => {
      const storedCart = readCart();
      let total = 0;
      for (let i = 0; i < storedCart.length; i += 1) {
        total += storedCart[i].quantity;
      }
      setCartCount(total);
      setIsCartReady(true);
    }, 0);

    //Aggiorna conteggio quando il carrello cambia.
    const handleCartChange = () => {
      const storedCart = readCart();
      let total = 0;
      for (let i = 0; i < storedCart.length; i += 1) {
        total += storedCart[i].quantity;
      }
      setCartCount(total);
    };

    window.addEventListener("bwa-cart-change", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("bwa-cart-change", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, []);

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
                <Link
                  href="/profile"
                  aria-label="Profile"
                  title="Profile"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  <span className="hidden sm:inline">Profile</span>
                  <User className="h-4 w-4 sm:hidden" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Sign Out"
                  title="Sign Out"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  <span className="hidden sm:inline">Sign Out</span>
                  <LogOut className="h-4 w-4 sm:hidden" aria-hidden="true" />
                </button>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    aria-label="Dashboard"
                    title="Dashboard"
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                    <LayoutDashboard
                      className="h-4 w-4 sm:hidden"
                      aria-hidden="true"
                    />
                  </Link>
                ) : null}
                <div className="hidden h-8 w-px bg-zinc-200 sm:block" />
                <Link
                  href="/products"
                  aria-label="Catalog"
                  title="Catalog"
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "hidden sm:flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 sm:w-10 sm:px-0 md:w-auto md:px-4",
                  })}
                >
                  <span className="hidden md:inline">Catalog</span>
                  <ShoppingBag
                    className="h-4 w-4 md:h-5 md:w-5"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/cart"
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "hidden sm:flex items-center justify-center gap-1 relative sm:w-10 sm:px-0 md:w-auto md:px-3",
                  })}
                >
                  <span className="hidden md:inline">Cart</span>
                  <ShoppingCart className="h-4 w-4 md:ml-1.5 md:h-5 md:w-5" />
                  {isCartReady && cartCount > 0 ? (
                    <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 sm:absolute sm:-right-1 sm:-top-1 sm:ml-0 md:static md:ml-1">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  aria-label="Sign Up"
                  title="Sign Up"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  <span className="hidden sm:inline">Sign Up</span>
                  <UserPlus className="h-4 w-4 sm:hidden" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  aria-label="Login"
                  title="Login"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  <span className="hidden sm:inline">Login</span>
                  <LogIn className="h-4 w-4 sm:hidden" aria-hidden="true" />
                </Link>

                <div className="h-8 w-px bg-zinc-200 sm:block" />
                <Link
                  href="/products"
                  aria-label="Catalog"
                  title="Catalog"
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "hidden sm:flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 sm:w-10 sm:px-0 md:w-auto md:px-4",
                  })}
                >
                  <span className="hidden md:inline">Catalog</span>
                  <ShoppingBag
                    className="h-4 w-4 md:h-5 md:w-5"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="/cart"
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "hidden sm:flex items-center justify-center gap-1 relative sm:w-10 sm:px-0 md:w-auto md:px-3",
                  })}
                >
                  <span className="hidden md:inline">Cart</span>
                  <ShoppingCart className="h-4 w-4 md:ml-1.5 md:h-5 md:w-5" />
                  {isCartReady && cartCount > 0 ? (
                    <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 sm:absolute sm:-right-1 sm:-top-1 sm:ml-0 md:static md:ml-1">
                      {cartCount}
                    </span>
                  ) : null}
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
