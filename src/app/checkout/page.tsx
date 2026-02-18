"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import {
  createApiOrder,
  getApiProducts,
  type CatalogProduct,
} from "../../lib/api";
import { type CartItem, clearCart, readCart } from "../../lib/cart-storage";
import { useAuth } from "../../hooks/useAuth";

//Pagina checkout con login obbligatorio.
const CheckoutPage = () => {
  //Router per simulare il redirect post ordine.
  const router = useRouter();
  //Dati utente dalla sessione demo.
  const { user, session, isAuthenticated, isReady: isAuthReady } = useAuth();
  //Stato locale carrello.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productsCatalog, setProductsCatalog] = useState<CatalogProduct[]>([]);
  const [isCartReady, setIsCartReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    //Carica il carrello dopo il primo render.
    const timer = window.setTimeout(async () => {
      const storedCart = readCart();
      setCartItems(storedCart);
      try {
        const apiProducts = await getApiProducts("", "");
        setProductsCatalog(apiProducts);
      } catch {
        setProductsCatalog([]);
      } finally {
        setIsCartReady(true);
      }
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
    originalPrice?: number;
    discountPercentage: number;
    quantity: number;
    lineTotal: number;
  }[] = [];
  let subtotal = 0;

  for (let i = 0; i < cartItems.length; i += 1) {
    const cartItem = cartItems[i];
    const product = productsCatalog.find(
      (item) => item.id === cartItem.productId,
    );
    if (!product) {
      continue;
    }
    const lineTotal = product.price * cartItem.quantity;
    subtotal += lineTotal;
    detailedItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage,
      quantity: cartItem.quantity,
      lineTotal,
    });
  }

  const total = subtotal;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    //TODO:vulnerabilita:CSRF sulla conferma pagamento senza token.
    //TODO:vulnerabilita:SSRF se la validazione del pagamento chiama URL esterne.
    if (!session?.token || !user) {
      setErrorMessage("Please login again and retry checkout.");
      return;
    }

    const payloadItems = cartItems
      .map((item) => {
        const productId = Number(item.productId);
        return {
          product_id: productId,
          quantity: item.quantity,
        };
      })
      .filter(
        (item) => Number.isFinite(item.product_id) && item.product_id > 0,
      );

    if (payloadItems.length === 0) {
      setErrorMessage("Your cart contains invalid items.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createApiOrder(session.token, {
        items: payloadItems,
      });

      const createdOrder = response.order;
      const createdOrderId = `ord-${createdOrder.id}`;
      clearCart();
      setCartItems([]);
      router.push(`/order-success/${createdOrderId}`);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Checkout failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={isSubmitting}
              className="mt-6 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {isSubmitting ? "Processing..." : "Place order"}
            </button>
            {errorMessage ? (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}
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
                    <span className="flex flex-col">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      {item.discountPercentage > 0 ? (
                        <span className="text-xs font-semibold text-emerald-700">
                          -{item.discountPercentage}%
                        </span>
                      ) : null}
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
