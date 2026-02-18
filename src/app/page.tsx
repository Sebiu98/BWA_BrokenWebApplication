import { Check, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FeaturedCarousel from "./components/FeaturedCarousel";
import MaxWidthWrapper from "./components/MaxWidthWrapper";
import SiteFooter from "./components/SiteFooter";
import { userAvatars } from "../lib/user-avatars";

export default function Home() {
  //Hero page pubblica.
  return (
    <div className="bg-slate-50">
      <section>
        <MaxWidthWrapper
          className="pb-24 pt-4 lg:grid lg:grid-cols-3 
        sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-10 xl:pt-5 lg:pb-56 relative overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
            <Image
              src="/BWA_logo.png"
              alt="BWA background logo"
              fill
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 60vw, 0vw"
              className="object-contain object-center opacity-10 blur-[0.5px]"
              priority
            />
          </div>
          <div className="col-span-2 px-6 lg:px-0 lg:pt-4 relative z-10">
            <div
              className="relative mx-auto text-center lg:text-left flex 
            flex-col items-center lg:items-start"
            >
              <h1
                className="relative w-fit tracking-tight text-balance mt-16 
              font-bold leading-tight! text-gray-900 text-5xl md:text-6xl 
              lg:text-7xl"
              >
                Instant Game Keys. Play Without Limits.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-700">
                Get instant access to authentic game keys at competitive prices.
                BWA delivers{" "}
                <span className="font-semibold">
                  fast, secure, and verified
                </span>{" "}
                digital keys! No waiting, no risk.
              </p>

              <div className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
                >
                  Browse the catalog
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:ring-slate-300"
                >
                  How it works
                </Link>
              </div>

              <ul className="mt-8 space-y-2 text-left font-medium flex flex-col items-center sm:items-start">
                <div className="space-y-2">
                  <li className="flex gap-1.5 items-center text-left">
                    <Check className="w-5 h-5 shrink-0 text-green-600" />
                    Instant digital delivery
                  </li>
                  <li className="flex gap-1.5 items-center text-left">
                    <Check className="w-5 h-5 shrink-0 text-green-600" />
                    Verified & legitimate game keys
                  </li>
                  <li className="flex gap-1.5 items-center text-left">
                    <Check className="w-5 h-5 shrink-0 text-green-600" />
                    Secure payments and buyer protection
                  </li>
                </div>
              </ul>

              <div className="mt-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="flex -space-x-4">
                  {userAvatars.slice(0, 5).map((avatarPath) => (
                    <Image
                      key={avatarPath}
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100 object-cover"
                      src={avatarPath}
                      alt="user image"
                      width={40}
                      height={40}
                    />
                  ))}
                </div>
                <div className="flex flex-col justify-between items-center sm:items-start">
                  <div className="flex gap-0.5">
                    <Star className="h-4 w-4 text-green-600 fill-green-600" />
                    <Star className="h-4 w-4 text-green-600 fill-green-600" />
                    <Star className="h-4 w-4 text-green-600 fill-green-600" />
                    <Star className="h-4 w-4 text-green-600 fill-green-600" />
                    <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  </div>
                  <p>
                    <span className="font-semibold">128 happy reviews</span>
                  </p>
                  <p className="text-sm text-slate-600">4.9/5 average rating</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-full lg:col-span-1 w-full flex justify-center px-8 sm:px-16 md:px-0 mt-32 lg:mx-0 lg:mt-20 h-fit relative z-10">
            <div className="relative md:max-w-xl w-full">
              <div className="absolute -top-8 -left-8 h-40 w-40 rounded-full bg-emerald-200/70 blur-3xl" />
              <div className="absolute -bottom-10 right-6 h-32 w-32 rounded-full bg-sky-200/70 blur-3xl" />
              <FeaturedCarousel />
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
      <SiteFooter />
    </div>
  );
}
