import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SiteFooter from "../components/SiteFooter";

const HowItWorksPage = () => {
  //Pagina spiegazione flusso acquisto.
  return (
    <>
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-16 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-26">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Buying game keys with BWA
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              A simple flow from browsing to key delivery. Your key is delivered
              instantly after the purchase is confirmed.
            </p>
          </div>

          <section className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Check className="h-5 w-5 text-emerald-600" />
                </span>
                <h2 className="text-lg font-semibold text-slate-900">
                  1. Browse the catalog
                </h2>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Choose a title, compare discounts, and open the product page for
                details and reviews.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Check className="h-5 w-5 text-emerald-600" />
                </span>
                <h2 className="text-lg font-semibold text-slate-900">
                  2. Add to cart
                </h2>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Build your cart and review the order summary before checkout.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Check className="h-5 w-5 text-emerald-600" />
                </span>
                <h2 className="text-lg font-semibold text-slate-900">
                  3. Checkout & receive key
                </h2>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Sign in to complete the purchase. The key appears on the order
                confirmation page immediately.
              </p>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  What happens after checkout
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Once the payment is confirmed, you are redirected to the order
                  success page where your key is shown with a copy button.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Instant delivery
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Keys stay visible
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  The order success page keeps the key visible for quick access.
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Support is always on
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Use the support section if you experience issues with a key.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">FAQ</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">
                    Do I need an account?
                  </p>
                  <p className="mt-2">
                    You can browse and add to cart without an account. You need
                    to sign in to complete the checkout.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    When do I see the key?
                  </p>
                  <p className="mt-2">
                    Right after the purchase is confirmed on the order success
                    page.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    Can I buy multiple keys?
                  </p>
                  <p className="mt-2">
                    Yes, just increase quantities in the cart.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Ready to start?
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Explore the catalog and lock in your next game key.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Browse catalog
                </Link>
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  View cart
                </Link>
              </div>
            </div>
          </section>
        </MaxWidthWrapper>
      </main>
      <SiteFooter />
    </>
  );
};

export default HowItWorksPage;
