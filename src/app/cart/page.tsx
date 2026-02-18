"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { getApiProducts, type CatalogProduct } from "../../lib/api";
import {
  type CartItem,
  clearCart,
  readCart,
  removeCartItem,
  updateCartItem,
} from "../../lib/cart-storage";

//Pagina carrello con dati mock.
const CartPage = () => {
  //Stato locale del carrello.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productsCatalog, setProductsCatalog] = useState<CatalogProduct[]>([]);
  const [isReady, setIsReady] = useState(false);

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
        setIsReady(true);
      }
    }, 0);

    //Aggiorna il carrello quando cambia altrove.
    const handleCartChange = () => {
      const storedCart = readCart();
      setCartItems(storedCart);
    };

    window.addEventListener("bwa-cart-change", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("bwa-cart-change", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, []);

  //Costruisce le righe per la UI.
  const detailedItems: {
    productId: string;
    name: string;
    image: string;
    platform: string;
    price: number;
    originalPrice?: number;
    discountPercentage: number;
    quantity: number;
    lineTotal: number;
  }[] = [];
  let subtotal = 0;
  let totalItems = 0;

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
    totalItems += cartItem.quantity;
    detailedItems.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      platform: product.platform,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage,
      quantity: cartItem.quantity,
      lineTotal,
    });
  }

  const serviceFee = subtotal > 0 ? 1.99 : 0;
  const total = subtotal + serviceFee;

  //TODO:vulnerabilita:manipolazione prezzi/quantita se il backend accetta il totale dal client.
  //TODO:vulnerabilita:open redirect dopo add-to-cart (quando avremo backend).

  const handleQuantityChange = (productId: string, value: string) => {
    //Aggiorna la quantita e ricarica il carrello.
    let nextQuantity = Number(value);
    if (!nextQuantity || nextQuantity < 1) {
      nextQuantity = 1;
    }
    updateCartItem(productId, nextQuantity);
    setCartItems(readCart());
  };

  const handleRemove = (productId: string) => {
    //Rimuove il prodotto dal carrello.
    removeCartItem(productId);
    setCartItems(readCart());
  };

  const handleClear = () => {
    //Svuota tutto il carrello.
    clearCart();
    setCartItems([]);
  };

  if (!isReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading cart...</p>
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
              Start browsing the catalog to add your first game key.
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

  //Layout carrello completo.
  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-56">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Shopping cart
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Review your items
          </h1>
          <p className="text-sm text-slate-600">
            You have {totalItems} item{totalItems === 1 ? "" : "s"} in your
            cart.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {detailedItems.map((item) => {
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
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {item.platform}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">
                      {item.name}
                    </h2>
                    {item.discountPercentage > 0 ? (
                      <p className="mt-1">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          -{item.discountPercentage}%
                        </span>
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-slate-600">
                      {item.originalPrice ? (
                        <span className="mr-2 text-xs text-slate-400 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      ) : null}
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <label className="text-xs text-slate-500">
                      Quantity
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(
                            item.productId,
                            event.target.value,
                          )
                        }
                        className="mt-1 w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </label>
                    <p className="text-sm font-semibold text-slate-900">
                      ${item.lineTotal.toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId)}
                      className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-700"
            >
              Clear cart
            </button>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
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
            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Proceed to checkout
            </Link>
            <p className="mt-3 text-xs text-slate-500">
              Login is required to complete the purchase.
            </p>
          </aside>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default CartPage;
