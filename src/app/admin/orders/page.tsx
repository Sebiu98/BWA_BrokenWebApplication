"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import OrderDetailsModal from "../../components/OrderDetailsModal";
import { useAuth } from "../../../hooks/useAuth";
import {
  ApiRequestError,
  getApiAdminOrders,
  type ApiOrder,
  updateApiOrderStatus,
} from "../../../lib/api";

//Lista ordini admin.
const AdminOrdersPage = () => {
  //Dati utente dalla sessione.
  const { user, session, isAdmin, isReady } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isOrdersReady, setIsOrdersReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);

  //TODO:vulnerabilita:IDOR sugli ordini senza controlli server-side.
  //TODO:vulnerabilita:accesso admin solo lato client.
  useEffect(() => {
    const loadOrders = async () => {
      if (!session?.token || !isAdmin) {
        setOrders([]);
        setIsOrdersReady(true);
        return;
      }

      try {
        const apiOrders = await getApiAdminOrders(session.token);
        setOrders(apiOrders);
      } catch {
        setOrders([]);
      } finally {
        setIsOrdersReady(true);
      }
    };

    void loadOrders();
  }, [isAdmin, session?.token]);

  const toErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof ApiRequestError) {
      return error.message || fallback;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

  const handleUpdateStatus = async (
    orderId: number,
    status: "pending" | "completed" | "cancelled",
  ) => {
    if (!session?.token) {
      return;
    }

    setIsSaving(true);
    setUpdatingOrderId(orderId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await updateApiOrderStatus(
        session.token,
        orderId,
        status,
      );
      setOrders((prev) =>
        prev.map((item) => (item.id === orderId ? response.order : item)),
      );
      setSuccessMessage("Order status updated.");
    } catch (error) {
      setErrorMessage(toErrorMessage(error, "Failed to update order status."));
    } finally {
      setIsSaving(false);
      setUpdatingOrderId(null);
    }
  };

  if (!isReady || !isOrdersReady) {
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
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleDateString()
      : "-";
    const total = Number(order.total_amount);
    orderCards.push(
      <div
        key={order.id}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <span>Order ord-{order.id}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {order.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {order.user?.email ?? "-"}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <span>{orderDate}</span>
          <span className="text-base font-semibold text-slate-900">
            ${total.toFixed(2)}
          </span>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Items: {order.items.length}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleUpdateStatus(order.id, "pending")}
            disabled={isSaving && updatingOrderId === order.id}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => handleUpdateStatus(order.id, "completed")}
            disabled={isSaving && updatingOrderId === order.id}
            className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => handleUpdateStatus(order.id, "cancelled")}
            disabled={isSaving && updatingOrderId === order.id}
            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            Cancelled
          </button>
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

        {errorMessage ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No orders found.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orderCards}
          </div>
        )}
      </MaxWidthWrapper>
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </main>
  );
};

export default AdminOrdersPage;
