"use client";

import Link from "next/link";

export default function NotFound() {
  //Pagina 404.
  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <main className="bwa-404-page">
      <div className="bwa-404-noise" aria-hidden="true" />
      <div className="bwa-404-overlay" aria-hidden="true" />
      <div className="bwa-404-terminal">
        <h1 className="text-3xl font-semibold">
          Error <span className="bwa-404-errorcode">404</span>
        </h1>
        <p className="bwa-404-output">
          The page you are looking for might have been removed, had its name
          changed or is temporarily unavailable.
        </p>
        <p className="bwa-404-output">
          Please try to{" "}
          <button type="button" onClick={handleBack} className="bwa-404-link">
            go back
          </button>{" "}
          or{" "}
          <Link href="/" className="bwa-404-link">
            return to the homepage
          </Link>
          .
        </p>
        <p className="bwa-404-output">Good luck.</p>
      </div>
    </main>
  );
}
