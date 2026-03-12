"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import OrderDetailsModal from "../components/OrderDetailsModal";
import {
  ApiRequestError,
  getApiAdminOrders,
  getApiAdminProducts,
  getApiUsers,
  type ApiOrder,
} from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiRequestError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

// Dashboard admin con dati letti da API.
const AdminPage = () => {
  const { user, session, isReady } = useAuth();
  const [productsCount, setProductsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isPageReady, setIsPageReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsPageReady(false);
      setErrorMessage("");

      if (!session?.token) {
        setProductsCount(0);
        setUsersCount(0);
        setOrders([]);
        setIsPageReady(true);
        return;
      }

      try {
        const [products, users, adminOrders] = await Promise.all([
          getApiAdminProducts(session.token),
          getApiUsers(session.token),
          getApiAdminOrders(session.token),
        ]);
        setProductsCount(products.length);
        setUsersCount(users.length);
        setOrders(adminOrders);
      } catch (error) {
        setProductsCount(0);
        setUsersCount(0);
        setOrders([]);
        setErrorMessage(toErrorMessage(error, "Unable to load admin data."));
      } finally {
        setIsPageReady(true);
      }
    };

    void loadDashboardData();
  }, [session?.token]);

  if (!isReady || !isPageReady) {
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
              Admin access requires login
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in first, then open the admin area.
            </p>
            <Link
              href="/login?next=/admin"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  let totalRevenue = 0;
  for (let i = 0; i < orders.length; i += 1) {
    if (orders[i].status !== "completed") {
      continue;
    }
    totalRevenue += Number(orders[i].total_amount);
  }

  const stats = [
    { label: "Total users", value: String(usersCount) },
    { label: "Products", value: String(productsCount) },
    { label: "Orders", value: String(orders.length) },
    { label: "Revenue", value: "$" + totalRevenue.toFixed(2) },
  ];

  const recentOrders = orders.slice(0, 3);

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

        {errorMessage ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

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
          {stats.map((stat) => (
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
            </div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">Recent orders</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentOrders.map((order) => (
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
              </div>
            ))}
          </div>
        </section>
      </MaxWidthWrapper>
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        canViewKeys={false}
      />
    </main>
  );
};

export default AdminPage;