"use client";

import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import OrderDetailsModal from "../components/OrderDetailsModal";
import { useAuth } from "../../hooks/useAuth";
import {
  getApiMyOrders,
  meApiAuth,
  type ApiAuthUser,
  type ApiOrder,
} from "../../lib/api";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  //Legge utente dalla sessione.
  const { user, session, isReady } = useAuth();
  const [profileDetails, setProfileDetails] = useState<ApiAuthUser | null>(
    null,
  );
  const [purchaseHistory, setPurchaseHistory] = useState<ApiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [isOrdersReady, setIsOrdersReady] = useState(false);
  //TODO:vulnerabilita:IDOR se si permette di cambiare userId senza controlli server-side.

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.token) {
        setProfileDetails(null);
        setIsProfileReady(true);
        return;
      }

      try {
        const me = await meApiAuth(session.token);
        setProfileDetails(me);
      } catch {
        setProfileDetails(null);
      } finally {
        setIsProfileReady(true);
      }
    };

    void loadProfile();
  }, [session?.token]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!session?.token) {
        setPurchaseHistory([]);
        setIsOrdersReady(true);
        return;
      }

      try {
        const apiOrders = await getApiMyOrders(session.token);
        setPurchaseHistory(apiOrders);
      } catch {
        setPurchaseHistory([]);
      } finally {
        setIsOrdersReady(true);
      }
    };

    void loadOrders();
  }, [session?.token]);

  //Se la sessione non e pronta, mostra un testo semplice.
  if (!isReady || !isProfileReady || !isOrdersReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="px-6 py-16 lg:px-0">
          <p className="text-sm text-slate-600">Loading profile...</p>
        </MaxWidthWrapper>
      </main>
    );
  }

  //Se non e loggato, mostra messaggio.
  if (!user) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="px-6 py-16 lg:px-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
            <p className="mt-2 text-sm text-slate-600">
              Please log in to view your profile.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  const displayName = profileDetails?.username || user.name;
  const fullName = [profileDetails?.name, profileDetails?.surname]
    .filter(Boolean)
    .join(" ");
  const avatar = profileDetails?.avatar || "/avatars/avatar-01.jpg";
  const memberSince = profileDetails?.created_at
    ? new Date(profileDetails.created_at).toLocaleDateString()
    : "-";

  const normalizeStatus = (status: string): "pending" | "completed" | "cancelled" => {
    if (status === "completed" || status === "cancelled") {
      return status;
    }
    return "pending";
  };

  let totalSaved = 0;
  for (let i = 0; i < purchaseHistory.length; i += 1) {
    const order = purchaseHistory[i];
    const normalizedStatus = normalizeStatus(order.status);
    if (normalizedStatus === "cancelled") {
      continue;
    }

    for (let j = 0; j < order.items.length; j += 1) {
      const item = order.items[j];
      const originalUnitPrice = Number(item.product?.price ?? item.unit_price);
      const paidUnitPrice = Number(item.unit_price);
      const savedPerUnit =
        originalUnitPrice > paidUnitPrice ? originalUnitPrice - paidUnitPrice : 0;
      totalSaved += savedPerUnit * item.quantity;
    }
  }

  //Prepara le card per ordine completo.
  const purchaseCards = [];
  for (let i = 0; i < purchaseHistory.length; i += 1) {
    const order = purchaseHistory[i];
    const normalizedStatus = normalizeStatus(order.status);
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleDateString()
      : "-";
    const orderTotal = Number(order.total_amount);
    let totalItems = 0;
    for (let j = 0; j < order.items.length; j += 1) {
      totalItems += order.items[j].quantity;
    }

    const statusClassName =
      normalizedStatus === "completed"
        ? "bg-emerald-100 text-emerald-700"
        : normalizedStatus === "cancelled"
          ? "bg-red-100 text-red-700"
          : "bg-amber-100 text-amber-700";

    purchaseCards.push(
      <div
        key={order.id}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">
            Order ord-{order.id}
          </h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusClassName}`}
          >
            {normalizedStatus}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1 text-sm text-slate-600">
            <p>Date: {orderDate}</p>
            <p>Items: {totalItems}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              Total: ${orderTotal.toFixed(2)}
            </p>
            <button
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View details
            </button>
          </div>
        </div>
      </div>,
    );
  }

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="px-6 py-16 lg:px-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Image
              src={avatar}
              alt={displayName}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-slate-100"
            />
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              {displayName}
            </h1>
            {fullName ? (
              <p className="mt-1 text-sm text-slate-600">{fullName}</p>
            ) : null}
            <p className="mt-2 text-sm text-slate-600">
              Member since: {memberSince}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Your savings
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              You saved ${totalSaved.toFixed(2)} by shopping on BWA.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="px-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Purchase history
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Keys are valid for 30 days from order confirmation.
            </p>
          </div>

          {purchaseHistory.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              No purchases yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">{purchaseCards}</div>
          )}
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

export default ProfilePage;
