"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import {
  getApiOrderById,
  getApiProducts,
  type ApiOrder,
  type CatalogProduct,
} from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";
import { type OrderSummary, readLastOrder } from "../../../lib/order-storage";

//Pagina conferma ordine con chiavi mock.
const OrderSuccessPage = () => {
  //Legge l'id ordine dalla route.
  const params = useParams();
  const orderId = params?.orderId ? String(params.orderId) : "";
  //Stato locale per ordine.
  const { session } = useAuth();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [apiOrder, setApiOrder] = useState<ApiOrder | null>(null);
  const [productsCatalog, setProductsCatalog] = useState<CatalogProduct[]>([]);
  const [isReady, setIsReady] = useState(false);

  //TODO:vulnerabilita:IDOR su orderId se non si verifica il proprietario.
  //TODO:vulnerabilita:riuso key se non viene marcata come usata nel backend.

  useEffect(() => {
    //Carica ordine dopo il primo render.
    const timer = window.setTimeout(async () => {
      const storedOrder = readLastOrder();
      setOrder(storedOrder);
      try {
        const numericOrderId = Number(orderId.replace(/^ord-/, ""));
        if (
          session?.token &&
          Number.isFinite(numericOrderId) &&
          numericOrderId > 0
        ) {
          const fetchedOrder = await getApiOrderById(
            session.token,
            numericOrderId,
          );
          setApiOrder(fetchedOrder);
        } else {
          setApiOrder(null);
        }
        const apiProducts = await getApiProducts("", "");
        setProductsCatalog(apiProducts);
      } catch {
        setApiOrder(null);
        setProductsCatalog([]);
      } finally {
        setIsReady(true);
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [orderId, session?.token]);

  const handleCopy = (key: string) => {
    //Copia la key negli appunti.
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      alert("Key copied.");
    }
  };

  if (!isReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading order...</p>
        </MaxWidthWrapper>
      </main>
    );
  }

  const hasMatchingFallbackOrder = Boolean(order && order.id === orderId);
  const hasApiOrder = Boolean(apiOrder);

  if (!hasApiOrder && !hasMatchingFallbackOrder) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Order not found
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              We could not find this order in your recent activity.
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

  const displayOrderId = apiOrder ? `ord-${apiOrder.id}` : orderId;
  const displayOrderDate = apiOrder?.created_at
    ? new Date(apiOrder.created_at).toISOString().slice(0, 10)
    : (order?.date ?? "-");
  const displayOrderTotal = apiOrder
    ? Number(apiOrder.total_amount)
    : (order?.total ?? 0);
  const displayOrderEmail = apiOrder?.user?.email || order?.userEmail || "-";

  //Costruisce lista dei prodotti acquistati.
  const purchasedItems = [];
  const baseItems = apiOrder
    ? apiOrder.items.map((item) => {
        return {
          productId: String(item.product_id),
          quantity: item.quantity,
          productName: item.product
            ? item.product.name
            : `Product #${item.product_id}`,
        };
      })
    : (order?.items ?? []).map((item) => {
        return {
          productId: item.productId,
          quantity: item.quantity,
          productName: "",
        };
      });

  for (let i = 0; i < baseItems.length; i += 1) {
    const item = baseItems[i];
    const product = productsCatalog.find(
      (entry) => entry.id === item.productId,
    );
    if (!product) {
      continue;
    }
    const key = `BWA-${displayOrderId}-${product.id}`;
    purchasedItems.push({
      productId: product.id,
      name: item.productName || product.name,
      image: product.image,
      quantity: item.quantity,
      key,
    });
  }

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-56">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Order confirmed
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
            Thanks for your purchase
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Order ID: <span className="font-semibold">{displayOrderId}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Purchase date: {displayOrderDate}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Your keys</h2>
            {purchasedItems.map((item) => {
              return (
                <div
                  key={item.productId}
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
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Quantity: {item.quantity}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
                        {item.key}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.key)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Copy key
                      </button>
                    </div>
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
                <span className="font-semibold text-slate-900">
                  {apiOrder ? apiOrder.status : "pending"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email</span>
                <span>{displayOrderEmail}</span>
              </div>
            </div>
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
