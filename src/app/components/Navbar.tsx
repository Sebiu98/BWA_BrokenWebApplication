"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { ShoppingCart } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="sticky z-100 h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span className="text-black"> BWA </span>
          </Link>

          <div className="h-full flex items-center space-x-4">
            {user ? (
              <>
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
                  href="/chart"
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
