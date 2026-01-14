/* eslint-disable @next/next/no-img-element */
import { Check, Star } from "lucide-react";
import MaxWidthWrapper from "../components/MaxWidthWrapper";

export default function Home() {
  return (
    <div className="bg-slate-50">
      <section>
        <MaxWidthWrapper
          className="pb-24 pt-10 lg:grid lg:grid-cols-3 
        sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-24 xl:pt-32 lg:pb-52"
        >
          <div className="col-span-2 px-6 lg:px-0 lg:pt-4">
            <div
              className="relative mx-auto text-center lg:text-left flex 
            flex-col items-center lg:items-start"
            >
              <div className="absolute w-28 left-0 -top-20 hidden lg:block">
                <img src="/BWA_logo.png" alt="BWA_Logo" className="w-full" />
              </div>
              <h1
                className="relative w-fit tracking-tight text-balance mt-16 
              font-bold !leading-tight text-gray-900 text-5x1 md:text-6xl 
              md:text-7xl"
              >
                Instant Game Keys. Play Without Limits.
              </h1>
              <p>
                Get instant access to authentic game keys at competitive prices.
                BWA delivers{" "}
                <span className="font-semibold">
                  fast, secure, and verified
                </span>{" "}
                digital keys! No waiting, no risk.
              </p>

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
                <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src={"/users/user-1.png"}
                    alt="user image"
                  />
                <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src={"/users/user-2.png"}
                    alt="user image"
                  />
                <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src={"/users/user-3.png"}
                    alt="user image"
                  />
                <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src={"/users/user-4.jpg"}
                    alt="user image"
                  />
                <img
                    className="inline-block object-cover h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src={"/users/user-5.jpg"}
                    alt="user image"
                  />
                </div>
                <div className="flex flex-col justify-between items-center sm:items-start">
                  <div className="flex gap-0.5">
                    <Star className="h-4 w-4 text-green-600 fill-green-600"/>
                    <Star className="h-4 w-4 text-green-600 fill-green-600"/>
                    <Star className="h-4 w-4 text-green-600 fill-green-600"/>
                    <Star className="h-4 w-4 text-green-600 fill-green-600"/>
                    <Star className="h-4 w-4 text-green-600 fill-green-600"/>
                  </div>
                  <p><span className="font-semibold">128 happy reviews</span></p>

                </div>
              </div>
            </div>
          </div>


          <div className="col-span-full lg:col-span-1 w-full flex justify-center px-8 sm:px-16 md:px-0 mt-32 lg:mx-0 lg:mt-20 h-fit">
            <div className="relative md:max-w-xl">
              
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </div>
  );
}
