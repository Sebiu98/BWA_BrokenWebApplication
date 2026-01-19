"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { ShoppingCart } from "lucide-react";
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
                    className: "hidden sm:flex items-center gap-1 relative",
                  })}
                >
                  Cart
                  <ShoppingCart className="ml-1.5 h-5 w-5" />
                  {isCartReady && cartCount > 0 ? (
                    <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {cartCount}
                    </span>
                  ) : null}
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
                    className: "hidden sm:flex items-center gap-1 relative",
                  })}
                >
                  Cart
                  <ShoppingCart className="ml-1.5 h-5 w-5" />
                  {isCartReady && cartCount > 0 ? (
                    <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
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
