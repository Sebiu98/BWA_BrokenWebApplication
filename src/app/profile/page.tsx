"use client";

import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { useAuth } from "../../hooks/useAuth";
import { mockUsers } from "../../data/users";
import { orders } from "../../data/orders";
import { products } from "../../data/products";

const ProfilePage = () => {
  //Legge utente dalla sessione.
  const { user, isReady } = useAuth();
  //TODO:vulnerabilita:IDOR se si permette di cambiare userId senza controlli server-side.

  //Se la sessione non e pronta, mostra un testo semplice.
  if (!isReady) {
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
            <h1 className="text-2xl font-semibold text-slate-900">
              Profile
            </h1>
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

  //Cerca info extra nel mock user.
  let profileUser = null;
  for (let i = 0; i < mockUsers.length; i += 1) {
    if (mockUsers[i].email === user.email) {
      profileUser = mockUsers[i];
      break;
    }
  }

  const displayName = profileUser ? profileUser.name : user.name;
  const avatar = profileUser ? profileUser.avatar : "/users/user-1.png";
  const memberSince = profileUser ? profileUser.memberSince : "Jan 2025";

  //Filtra ordini per utente.
  const purchaseHistory = [];
  for (let i = 0; i < orders.length; i += 1) {
    const order = orders[i];
    if (order.userEmail === user.email) {
      purchaseHistory.push(order);
    }
  }

  //Calcola il risparmio totale e prepara le card dei giochi.
  let totalSaved = 0;
  const purchaseCards = [];
  for (let i = 0; i < purchaseHistory.length; i += 1) {
    const order = purchaseHistory[i];
    for (let j = 0; j < order.items.length; j += 1) {
      const item = order.items[j];
      let itemImage = "/BWA_logo.png";
      let originalPrice = 0;

      for (let k = 0; k < products.length; k += 1) {
        const product = products[k];
        if (product.id === item.productId) {
          itemImage = product.image;
          if (product.originalPrice) {
            originalPrice = product.originalPrice;
          }
          break;
        }
      }

      if (originalPrice > item.price) {
        totalSaved += (originalPrice - item.price) * item.quantity;
      }

      purchaseCards.push(
        <div
          key={`${order.id}-${item.productId}`}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-50 sm:h-24 sm:w-24">
              <Image
                src={itemImage}
                alt={item.name}
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 pr-24">
              <h3 className="text-base font-semibold text-slate-900">
                {item.name}
              </h3>
            </div>
            <div className="absolute right-0 top-0 text-right">
              <span className="text-sm font-semibold text-emerald-700">
                {order.status}
              </span>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-right">
              <p className="text-sm text-slate-600">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
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
            <div className="mt-6 grid gap-4">
              {purchaseCards}
            </div>
          )}
        </section>
      </MaxWidthWrapper>
    </main>
  );
};

export default ProfilePage;
