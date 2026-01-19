"use client";

import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import { mockUsers } from "../../../data/users";
import { useAuth } from "../../../hooks/useAuth";

//Lista utenti admin.
const AdminUsersPage = () => {
  //Dati utente dalla sessione.
  const { user, isAdmin, isReady } = useAuth();

  //TODO:vulnerabilita:IDOR sugli utenti senza verifica server-side.
  //TODO:vulnerabilita:accesso admin non protetto da backend.

  if (!isReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading users...</p>
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
              href="/login?next=/admin/users"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  const userCards = [];
  for (let i = 0; i < mockUsers.length; i += 1) {
    const item = mockUsers[i];
    userCards.push(
      <div
        key={item.id}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100">
          <Image
            src={item.avatar}
            alt={item.name}
            width={64}
            height={64}
            className="h-16 w-16 object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
          <p className="text-sm text-slate-600">{item.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            Member since {item.memberSince}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {item.role.toUpperCase()}
          </span>
          <button
            type="button"
            className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
          >
            View profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-56">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Admin users
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Manage accounts
          </h1>
          <p className="text-sm text-slate-600">
            Review active users and their account status.
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
            href="/admin/products"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Products
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Orders
          </Link>
        </div>

        <div className="mt-8 space-y-4">{userCards}</div>
      </MaxWidthWrapper>
    </main>
  );
};

export default AdminUsersPage;
