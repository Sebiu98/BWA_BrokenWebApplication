"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import OrderDetailsModal from "../components/OrderDetailsModal";
import {
  getApiAdminOrders,
  getApiAdminProducts,
  getApiUsers,
  type ApiOrder,
} from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

//Dashboard admin con dati letti da API.
const AdminPage = () => {
  //Dati utente dalla sessione.
  const { user, session, isAdmin, isReady } = useAuth();
  const [productsCount, setProductsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isProductsReady, setIsProductsReady] = useState(false);

  //TODO:vulnerabilita:accesso admin senza controlli server-side.
  //TODO:vulnerabilita:privilege escalation se il ruolo e solo client-side.

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [products, users, adminOrders] = await Promise.all([
          session?.token && isAdmin
            ? getApiAdminProducts(session.token)
            : Promise.resolve([]),
          session?.token && isAdmin
            ? getApiUsers(session.token)
            : Promise.resolve([]),
          session?.token && isAdmin
            ? getApiAdminOrders(session.token)
            : Promise.resolve([]),
        ]);
        setProductsCount(products.length);
        setUsersCount(users.length);
        setOrders(adminOrders);
      } catch {
        setProductsCount(0);
        setUsersCount(0);
        setOrders([]);
      } finally {
        setIsProductsReady(true);
      }
    };

    void loadDashboardData();
  }, [isAdmin, session?.token]);

  if (!isReady || !isProductsReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading admin dashboard...</p>
        </MaxWidthWrapper>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Admin access required
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Please sign in with an admin account to continue.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Access denied
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Your account does not have admin permissions.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to catalog
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  //Calcola dati principali.
  let totalRevenue = 0;
  for (let i = 0; i < orders.length; i += 1) {
    totalRevenue += Number(orders[i].total_amount);
  }

  const stats = [
    { label: "Total users", value: String(usersCount) },
    { label: "Products", value: String(productsCount) },
    { label: "Orders", value: String(orders.length) },
    { label: "Revenue", value: "$" + totalRevenue.toFixed(2) },
  ];

  const statCards = [];
  for (let i = 0; i < stats.length; i += 1) {
    const stat = stats[i];
    statCards.push(
      <div
        key={stat.label}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {stat.label}
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {stat.value}
        </p>
      </div>,
    );
  }

  //Ordini recenti.
  const recentOrders = [];
  for (let i = 0; i < orders.length && i < 3; i += 1) {
    recentOrders.push(orders[i]);
  }

  const orderCards = [];
  for (let i = 0; i < recentOrders.length; i += 1) {
    const order = recentOrders[i];
    orderCards.push(
      <div
        key={order.id}
        className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Order ord-{order.id}</span>
          <span>{order.status}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{order.user?.email ?? "-"}</span>
          <span className="font-semibold text-slate-900">
            ${Number(order.total_amount).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString()
              : "-"}
          </span>
          <button
            type="button"
            onClick={() => setSelectedOrder(order)}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View details
          </button>
        </div>
      </div>,
    );
  }

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-56">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Dashboard overview
          </h1>
          <p className="text-sm text-slate-600">
            Monitor users, orders, and catalog activity from one place.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
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
          <Link
            href="/admin/orders"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Orders
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards}
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent orders
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orderCards}
          </div>
        </section>
      </MaxWidthWrapper>
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </main>
  );
};

export default AdminPage;
