"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getApiProducts, type CatalogProduct } from "../../lib/api";

//Carosello prodotti scontati.
const FeaturedCarousel = () => {
  //Prodotti caricati dal backend.
  const [featuredProducts, setFeaturedProducts] = useState<CatalogProduct[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  //Indice attivo del carosello.
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    //Carica prodotti dal backend.
    const loadProducts = async () => {
      try {
        const apiProducts = await getApiProducts("", "");

        //Usa solo prodotti scontati e sceglie 3 elementi casuali.
        const discounted = apiProducts.filter(
          (item) => item.discountPercentage > 0,
        );
        if (discounted.length === 0) {
          setFeaturedProducts([]);
        } else {
          const shuffled = [...discounted].sort(
            (a, b) => Number(a.id) - Number(b.id),
          );
          for (let i = shuffled.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
          }

          setFeaturedProducts(shuffled.slice(0, 3));
        }
      } catch {
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (activeIndex >= featuredProducts.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, featuredProducts.length]);

  useEffect(() => {
    if (featuredProducts.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => {
        if (prev + 1 >= featuredProducts.length) {
          return 0;
        }
        return prev + 1;
      });
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [featuredProducts.length]);

  const currentProduct =
    featuredProducts.length > 0 ? featuredProducts[activeIndex] : null;
  const hasMultiple = featuredProducts.length > 1;

  const goNext = () => {
    if (featuredProducts.length === 0) {
      return;
    }
    setActiveIndex((prev) => {
      if (prev + 1 >= featuredProducts.length) {
        return 0;
      }
      return prev + 1;
    });
  };

  const goPrev = () => {
    if (featuredProducts.length === 0) {
      return;
    }
    setActiveIndex((prev) => {
      if (prev - 1 < 0) {
        return featuredProducts.length - 1;
      }
      return prev - 1;
    });
  };

  if (isLoading) {
    return (
      <div className="relative rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <p className="text-sm text-slate-600">Loading featured products...</p>
      </div>
    );
  }

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

  const originalPrice = currentProduct.originalPrice ?? currentProduct.price;
  const discountPercent = currentProduct.discountPercentage;
  const hasDiscount =
    currentProduct.originalPrice !== undefined &&
    currentProduct.originalPrice > currentProduct.price;

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
          {hasDiscount ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Save {discountPercent}%
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              Featured
            </span>
          )}
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
          {featuredProducts.map((item, index) => {
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
