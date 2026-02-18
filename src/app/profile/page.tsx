"use client";

import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { useAuth } from "../../hooks/useAuth";
import {
  getApiMyOrders,
  getApiProducts,
  meApiAuth,
  type ApiAuthUser,
  type ApiOrder,
  type CatalogProduct,
} from "../../lib/api";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  //Legge utente dalla sessione.
  const { user, session, isReady } = useAuth();
  const [productsCatalog, setProductsCatalog] = useState<CatalogProduct[]>([]);
  const [profileDetails, setProfileDetails] = useState<ApiAuthUser | null>(
    null,
  );
  const [purchaseHistory, setPurchaseHistory] = useState<ApiOrder[]>([]);
  const [isProductsReady, setIsProductsReady] = useState(false);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [isOrdersReady, setIsOrdersReady] = useState(false);
  //TODO:vulnerabilita:IDOR se si permette di cambiare userId senza controlli server-side.

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const apiProducts = await getApiProducts("", "");
        setProductsCatalog(apiProducts);
      } catch {
        setProductsCatalog([]);
      } finally {
        setIsProductsReady(true);
      }
    };

    loadProducts();
  }, []);

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
  if (!isReady || !isProductsReady || !isProfileReady || !isOrdersReady) {
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

  //Calcola il risparmio totale e prepara le card dei giochi.
  let totalSaved = 0;
  const purchaseCards = [];
  for (let i = 0; i < purchaseHistory.length; i += 1) {
    const order = purchaseHistory[i];
    for (let j = 0; j < order.items.length; j += 1) {
      const item = order.items[j];
      const itemUnitPrice = Number(item.unit_price);
      let itemName = item.product
        ? item.product.name
        : `Product #${item.product_id}`;
      let itemImage = "/BWA_logo.png";
      let originalPrice = item.product?.price ? Number(item.product.price) : 0;

      for (let k = 0; k < productsCatalog.length; k += 1) {
        const product = productsCatalog[k];
        if (product.id === String(item.product_id)) {
          itemName = product.name;
          itemImage = product.image;
          if (product.originalPrice && originalPrice <= 0) {
            originalPrice = product.originalPrice;
          }
          break;
        }
      }

      const itemSavedPerUnit =
        originalPrice > itemUnitPrice ? originalPrice - itemUnitPrice : 0;
      const itemSavedTotal = itemSavedPerUnit * item.quantity;
      totalSaved += itemSavedTotal;

      purchaseCards.push(
        <div
          key={`${order.id}-${item.id}`}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-50 sm:h-24 sm:w-24">
              <Image
                src={itemImage}
                alt={itemName}
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 pr-24">
              <h3 className="text-base font-semibold text-slate-900">
                {itemName}
              </h3>
            </div>
            <div className="absolute right-0 top-0 text-right">
              <span className="text-sm font-semibold text-emerald-700">
                {order.status}
              </span>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-right">
              <p className="text-sm text-slate-600">
                ${(itemUnitPrice * item.quantity).toFixed(2)}
              </p>
              {itemSavedTotal > 0 ? (
                <p className="text-xs font-semibold text-emerald-700">
                  Saved ${itemSavedTotal.toFixed(2)}
                </p>
              ) : null}
            </div>
          </div>
        </div>,
      );
    }
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
          <h2 className="text-xl font-semibold text-slate-900">
            Purchase history
          </h2>

          {purchaseHistory.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              No purchases yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">{purchaseCards}</div>
          )}
        </section>
      </MaxWidthWrapper>
    </main>
  );
};

export default ProfilePage;
