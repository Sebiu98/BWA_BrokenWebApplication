"use client";

import { useEffect } from "react";
import Link from "next/link";
import MaxWidthWrapper from "./components/MaxWidthWrapper";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  //TODO:vulnerabilita:mostrare stack trace o dettagli sensibili.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We hit an unexpected error while loading this page.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to home
            </Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default ErrorPage;
