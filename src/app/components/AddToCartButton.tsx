"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  addCartItem,
  readCart,
  removeCartItem,
  type CartItem,
  updateCartItem,
} from "../../lib/cart-storage";
import { getApiProducts, type CatalogProduct } from "../../lib/api";

//Bottone semplice per aggiungere un prodotto al carrello.
type AddToCartButtonProps = {
  productId: string;
  className?: string;
  children: ReactNode;
};

const AddToCartButton = ({
  productId,
  className,
  children,
}: AddToCartButtonProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productsCatalog, setProductsCatalog] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const apiProducts = await getApiProducts("", "");
        setProductsCatalog(apiProducts);
      } catch {
        setProductsCatalog([]);
      }
    };

    loadProducts();
  }, []);

  const cartLines = useMemo(() => {
    const lines: Array<{
      id: string;
      name: string;
      image: string;
      price: number;
      originalPrice?: number;
      discountPercentage: number;
      quantity: number;
    }> = [];

    for (let i = 0; i < cartItems.length; i += 1) {
      const item = cartItems[i];
      const product = productsCatalog.find(
        (entry) => entry.id === item.productId,
      );
      if (!product) {
        continue;
      }
      lines.push({
        id: item.productId,
        name: product.name,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        quantity: item.quantity,
      });
    }
    return lines;
  }, [cartItems, productsCatalog]);
  const totals = useMemo(() => {
    let items = 0;
    let subtotal = 0;

    for (let i = 0; i < cartLines.length; i += 1) {
      items += cartLines[i].quantity;
      subtotal += cartLines[i].price * cartLines[i].quantity;
    }

    return { items, subtotal };
  }, [cartLines]);

  const handleClick = () => {
    //TODO:in futuro chiamare un endpoint backend per salvare il carrello.
    addCartItem(productId, 1);
    setCartItems(readCart());
    setIsPanelOpen(true);
  };

  const handleQuantityChange = (id: string, nextQuantity: number) => {
    if (nextQuantity < 1) {
      removeCartItem(id);
    } else {
      updateCartItem(id, nextQuantity);
    }
    setCartItems(readCart());
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>
      {isPanelOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setIsPanelOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-panel-title"
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col gap-6 bg-white p-6 shadow-xl ring-1 ring-slate-200"
          >
            <div className="flex items-center justify-between">
              <h2
                id="cart-panel-title"
                className="text-lg font-semibold text-slate-900"
              >
                Added to cart
              </h2>
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Cart items
              </p>
              <div className="max-h-[40vh] space-y-3 overflow-y-auto pr-1">
                {cartLines.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                    Your cart is empty.
                  </div>
                ) : (
                  cartLines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-white">
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-semibold text-slate-900">
                          {line.name}
                        </p>
                        {line.discountPercentage > 0 ? (
                          <p className="mt-1 text-xs font-semibold text-emerald-700">
                            -{line.discountPercentage}%
                          </p>
                        ) : null}
                        <div className="mt-2 flex items-center gap-3">
                          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(line.id, line.quantity - 1)
                              }
                              className="h-7 w-7 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-700">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(line.id, line.quantity + 1)
                              }
                              className="h-7 w-7 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(line.id, 0)}
                            className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        {line.originalPrice ? (
                          <p className="text-xs text-slate-400 line-through">
                            ${line.originalPrice.toFixed(2)}
                          </p>
                        ) : null}
                        <p className="text-sm font-semibold text-slate-900">
                          ${(line.price * line.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {cartLines.length > 0 ? (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-slate-600">
                  {totals.items} item{totals.items === 1 ? "" : "s"}
                </span>
                <span className="font-semibold text-slate-900">
                  ${totals.subtotal.toFixed(2)}
                </span>
              </div>
            ) : null}
            <p className="text-sm text-slate-600">
              Want to keep shopping or head to your cart?
            </p>
            <div className="mt-auto flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Continue shopping
              </button>
              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to cart
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
};

export default AddToCartButton;
