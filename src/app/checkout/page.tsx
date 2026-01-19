"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { products } from "../../data/products";
import { type CartItem, clearCart, readCart } from "../../lib/cart-storage";
import { writeLastOrder } from "../../lib/order-storage";
import { useAuth } from "../../hooks/useAuth";

//Pagina checkout con login obbligatorio.
const CheckoutPage = () => {
  //Router per simulare il redirect post ordine.
  const router = useRouter();
  //Dati utente dalla sessione demo.
  const { user, isAuthenticated, isReady: isAuthReady } = useAuth();
  //Stato locale carrello.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartReady, setIsCartReady] = useState(false);

  useEffect(() => {
    //Carica il carrello dopo il primo render.
    const timer = window.setTimeout(() => {
      const storedCart = readCart();
      setCartItems(storedCart);
      setIsCartReady(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  //Costruisce le righe per il riepilogo.
  const detailedItems: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    lineTotal: number;
  }[] = [];
  let subtotal = 0;

  for (let i = 0; i < cartItems.length; i += 1) {
    const cartItem = cartItems[i];
    const product = products.find((item) => item.id === cartItem.productId);
    if (!product) {
      continue;
    }
    const lineTotal = product.price * cartItem.quantity;
    subtotal += lineTotal;
    detailedItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      lineTotal,
    });
  }

  const serviceFee = subtotal > 0 ? 1.99 : 0;
  const total = subtotal + serviceFee;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    //TODO:vulnerabilita:CSRF sulla conferma pagamento senza token.
    //TODO:vulnerabilita:SSRF se la validazione del pagamento chiama URL esterne.
    //TODO:inviare ordine al backend e salvare su database.
    //TODO:validare pagamento lato server e creare record ordine.
    const orderId = "ord-" + Date.now();
    const orderDate = new Date().toISOString().slice(0, 10);
    const orderUserEmail = user?.email || "unknown";

    writeLastOrder({
      id: orderId,
      items: cartItems,
      total,
      date: orderDate,
      userEmail: orderUserEmail,
    });

    clearCart();
    setCartItems([]);
    router.push(`/order-success/${orderId}`);
  };

  if (!isAuthReady || !isCartReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading checkout...</p>
        </MaxWidthWrapper>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Sign in required
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Please log in or create an account to complete your purchase.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login?next=/checkout"
                className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to login
              </Link>
              <Link
                href="/register"
                className="inline-flex rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Create account
              </Link>
            </div>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  if (detailedItems.length === 0) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Your cart is empty
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Add a game key before continuing to checkout.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse catalog
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  //Controlli base lato frontend, il backend validera tutto.
  //Layout checkout completo.
  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-56">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Checkout
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Complete your purchase
          </h1>
          <p className="text-sm text-slate-600">
            You are signed in as {user?.email}.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Payment details
            </h2>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input
                  type="text"
                  required
                  placeholder="Jordan Smith"
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Card number
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={19}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Expiration
                  <input
                    type="text"
                    required
                    placeholder="12 / 28"
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  CVC
                  <input
                    type="text"
                    required
                    placeholder="123"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Place order
            </button>
          </form>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Order summary
            </h2>
            <div className="mt-4 space-y-3">
              {detailedItems.map((item) => {
                return (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between text-sm text-slate-600"
                  >
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${item.lineTotal.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default CheckoutPage;
