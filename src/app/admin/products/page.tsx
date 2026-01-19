"use client";

import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import { products } from "../../../data/products";
import { useAuth } from "../../../hooks/useAuth";

//Lista prodotti admin.
const AdminProductsPage = () => {
  //Dati utente dalla sessione.
  const { user, isAdmin, isReady } = useAuth();

  //TODO:vulnerabilita:IDOR su prodotti senza controlli server-side.
  //TODO:vulnerabilita:privilege escalation su azioni admin.

  if (!isReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading products...</p>
        </MaxWidthWrapper>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Admin access required
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Only administrators can view this page.
            </p>
            <Link
              href="/login?next=/admin/products"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  const productCards = [];
  for (let i = 0; i < products.length; i += 1) {
    const item = products[i];
    productCards.push(
      <div
        key={item.id}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-50">
          <Image
            src={item.image}
            alt={item.name}
            width={96}
            height={96}
            className="h-16 w-16 object-contain"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {item.category}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {item.name}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            ${item.price.toFixed(2)} · {item.platform}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Rating {item.rating.toFixed(1)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
            >
              Disable
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-56">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Admin products
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Catalog management
          </h1>
          <p className="text-sm text-slate-600">
            Review product data and apply catalog changes.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Users
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Orders
          </Link>
        </div>

        <div className="mt-8 space-y-4">{productCards}</div>
      </MaxWidthWrapper>
    </main>
  );
};

export default AdminProductsPage;
