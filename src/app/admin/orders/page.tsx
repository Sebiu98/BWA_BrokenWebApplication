"use client";

import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import { orders } from "../../../data/orders";
import { useAuth } from "../../../hooks/useAuth";

//Lista ordini admin.
const AdminOrdersPage = () => {
  //Dati utente dalla sessione.
  const { user, isAdmin, isReady } = useAuth();

  //TODO:vulnerabilita:IDOR sugli ordini senza controlli server-side.
  //TODO:vulnerabilita:accesso admin solo lato client.

  if (!isReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading orders...</p>
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
              href="/login?next=/admin/orders"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  const orderCards = [];
  for (let i = 0; i < orders.length; i += 1) {
    const order = orders[i];
    orderCards.push(
      <div
        key={order.id}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <span>Order {order.id}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {order.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{order.userEmail}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <span>{order.date}</span>
          <span className="text-base font-semibold text-slate-900">
            ${order.total.toFixed(2)}
          </span>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Items: {order.items.length}
        </div>
        <button
          type="button"
          className="mt-4 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
        >
          View details
        </button>
      </div>
    );
  }

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-56">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Admin orders
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Order management
          </h1>
          <p className="text-sm text-slate-600">
            Track order status and customer purchases.
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
            href="/admin/products"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Products
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderCards}
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default AdminOrdersPage;
