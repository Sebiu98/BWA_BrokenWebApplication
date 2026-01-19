"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "../../data/products";

//Carosello prodotti scontati.
const FeaturedCarousel = () => {
  //Lista scontati.
  const discountedProducts = [];
  for (let i = 0; i < products.length; i += 1) {
    if (products[i].originalPrice) {
      discountedProducts.push(products[i]);
    }
  }

  //Indice attivo del carosello.
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (discountedProducts.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => {
        if (prev + 1 >= discountedProducts.length) {
          return 0;
        }
        return prev + 1;
      });
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [discountedProducts.length]);

  const currentProduct =
    discountedProducts.length > 0
      ? discountedProducts[activeIndex]
      : null;
  const hasMultiple = discountedProducts.length > 1;

  const goNext = () => {
    if (discountedProducts.length === 0) {
      return;
    }
    setActiveIndex((prev) => {
      if (prev + 1 >= discountedProducts.length) {
        return 0;
      }
      return prev + 1;
    });
  };

  const goPrev = () => {
    if (discountedProducts.length === 0) {
      return;
    }
    setActiveIndex((prev) => {
      if (prev - 1 < 0) {
        return discountedProducts.length - 1;
      }
      return prev - 1;
    });
  };

  if (!currentProduct) {
    return (
      <div className="relative rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-slate-500">
            Featured deal
          </span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          No featured deals yet
        </h3>
        <p className="mt-3 text-sm text-slate-600">
          Check back soon for new discounts.
        </p>
      </div>
    );
  }

  const originalPrice = currentProduct.originalPrice
    ? currentProduct.originalPrice
    : currentProduct.price;
  const discountPercent =
    originalPrice > 0
      ? Math.round(
          ((originalPrice - currentProduct.price) / originalPrice) * 100
        )
      : 0;

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-slate-500">
          Featured deal
        </span>
        <div className="flex items-center gap-2">
          {hasMultiple ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous deal"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next deal"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Save {discountPercent}%
          </span>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {currentProduct.name}
      </h3>
      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 line-through">
            ${originalPrice.toFixed(2)}
          </p>
          <p className="text-2xl font-bold text-slate-900">
            ${currentProduct.price.toFixed(2)}
          </p>
        </div>
        <Link
          href={`/products/${currentProduct.id}`}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Buy now
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
        <div className="rounded-lg bg-slate-50 px-2 py-2">
          <p className="text-sm font-semibold text-slate-900">2 min</p>
          <p>Delivery</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-2">
          <p className="text-sm font-semibold text-slate-900">10k+</p>
          <p>Keys sold</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-2">
          <p className="text-sm font-semibold text-slate-900">24/7</p>
          <p>Support</p>
        </div>
      </div>
      {hasMultiple ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {discountedProducts.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to deal ${index + 1}`}
                className={
                  isActive
                    ? "h-2.5 w-6 rounded-full bg-slate-900"
                    : "h-2.5 w-2.5 rounded-full bg-slate-200"
                }
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default FeaturedCarousel;
