"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import { getApiOrderById, type ApiOrder } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

//Pagina conferma ordine API-first.
const OrderSuccessPage = () => {
  //Legge l'id ordine dalla route.
  const params = useParams();
  const orderId = params?.orderId ? String(params.orderId) : "";
  //Stato locale per ordine.
  const { session, isReady: isAuthReady } = useAuth();
  const [apiOrder, setApiOrder] = useState<ApiOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  //TODO:vulnerabilita:IDOR su orderId se non si verifica il proprietario.
  //TODO:vulnerabilita:riuso key se non viene marcata come usata nel backend.

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    let isMounted = true;

    const loadOrder = async () => {
      setIsReady(false);
      setErrorMessage("");
      setApiOrder(null);

      const numericOrderId = Number(orderId.replace(/^ord-/, ""));

      if (!session?.token) {
        if (isMounted) {
          setErrorMessage("Please sign in to view your order details.");
          setIsReady(true);
        }
        return;
      }

      if (!Number.isFinite(numericOrderId) || numericOrderId <= 0) {
        if (isMounted) {
          setErrorMessage("Invalid order id.");
          setIsReady(true);
        }
        return;
      }

      try {
        const fetchedOrder = await getApiOrderById(session.token, numericOrderId);
        if (isMounted) {
          setApiOrder(fetchedOrder);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load order details.",
          );
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void loadOrder();

    return () => {
      isMounted = false;
    };
  }, [isAuthReady, orderId, session?.token]);

  const handleCopy = (key: string) => {
    //Copia la key negli appunti.
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      alert("Key copied.");
    }
  };

  if (!isAuthReady || !isReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading order...</p>
        </MaxWidthWrapper>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Order unavailable</h1>
            <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to login
              </Link>
              <Link
                href="/products"
                className="inline-flex rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Back to catalog
              </Link>
            </div>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  if (!apiOrder) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Order not found</h1>
            <p className="mt-2 text-sm text-slate-600">
              We could not find this order in your account.
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

  const displayOrderId = `ord-${apiOrder.id}`;
  const displayOrderDate = apiOrder.created_at
    ? new Date(apiOrder.created_at).toISOString().slice(0, 10)
    : "-";
  const displayOrderTotal = Number(apiOrder.total_amount);
  const displayOrderEmail = apiOrder.user?.email || "-";

  //Costruisce lista dei prodotti acquistati da API ordine con chiavi reali.
  const purchasedItems = apiOrder.items.map((item) => {
    const productName = item.product
      ? item.product.name
      : `Product #${item.product_id}`;

    return {
      id: item.id,
      name: productName,
      image: "/BWA_logo.png",
      quantity: item.quantity,
      keys: item.game_keys ?? [],
    };
  });

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-56">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Order confirmed</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
            Thanks for your purchase
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Order ID: <span className="font-semibold">{displayOrderId}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">Purchase date: {displayOrderDate}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Your keys</h2>
            <p className="text-sm text-slate-600">
              Keys are valid for 30 days from order confirmation.
            </p>
            {purchasedItems.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
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
                    <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">Quantity: {item.quantity}</p>
                    {item.keys.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">
                        No keys assigned yet for this item.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {item.keys.map((keyItem) => {
                          return (
                            <div
                              key={keyItem.id}
                              className="flex flex-wrap items-center gap-2"
                            >
                              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
                                {keyItem.key_value}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(keyItem.key_value)}
                                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                Copy key
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Total paid</span>
                <span>${displayOrderTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="font-semibold text-slate-900">{apiOrder.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email</span>
                <span>{displayOrderEmail}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Key validity: 30 days from order confirmation.
            </p>
            <Link
              href="/products"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default OrderSuccessPage;
