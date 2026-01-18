import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { products } from "../../data/products";

type ProductsPageProps = {
  searchParams?: Promise<{
    search?: string;
    category?: string;
  }>;
};

const buildQuery = (search: string, category: string) => {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (category) {
    params.set("category", category);
  }
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
};

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const resolvedParams = (await searchParams) ?? {};
  const search = (resolvedParams.search ?? "").trim();
  const category = (resolvedParams.category ?? "").trim();
  const normalizedSearch = search.toLowerCase();

  const categories = Array.from(
    new Set(products.map((product) => product.category))
  ).sort();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = normalizedSearch
      ? product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch)
      : true;
    const matchesCategory = category
      ? product.category.toLowerCase() === category.toLowerCase()
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-10 xl:pt-5 lg:pb-56 relative overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              BWA Catalog
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
              Browse instant game keys
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
              Find the best deals on verified keys, delivered instantly after
              checkout.
            </p>
          </div>

          <form method="get" className="w-full max-w-md">
            <label className="block text-sm font-medium text-slate-700">
              Search
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search by game or genre"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Search
                </button>
              </div>
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-700">
              Category
              <div className="mt-2 flex gap-2">
                <select
                  name="category"
                  defaultValue={category}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">All categories</option>
                  {categories.map((categoryOption) => (
                    <option key={categoryOption} value={categoryOption}>
                      {categoryOption}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Apply
                </button>
              </div>
            </label>
          </form>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 text-sm">
          <Link
            href={buildQuery(search, "")}
            className={`rounded-full border px-3 py-1 transition ${
              category
                ? "border-slate-200 text-slate-600 hover:border-slate-300"
                : "border-slate-900 text-slate-900"
            }`}
          >
            All
          </Link>
          {categories.map((categoryOption) => (
            <Link
              key={categoryOption}
              href={buildQuery(search, categoryOption)}
              className={`rounded-full border px-3 py-1 transition ${
                categoryOption.toLowerCase() === category.toLowerCase()
                  ? "border-slate-900 text-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {categoryOption}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="uppercase tracking-[0.2em]">
                  {product.category}
                </span>
                <span>{product.platform}</span>
              </div>
              <div className="mt-4 flex h-36 items-center justify-center rounded-xl bg-slate-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={160}
                  height={160}
                  className="h-28 w-28 object-contain"
                />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                {product.name}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {product.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  {product.originalPrice ? (
                    <p className="text-xs text-slate-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </p>
                  ) : null}
                  <p className="text-lg font-semibold text-slate-900">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  {product.rating.toFixed(1)} / 5
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Link
                  href={`/products/${product.id}`}
                  className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View details
                </Link>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>

        <section id="how" className="mt-16 rounded-2xl bg-white p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Choose your game",
                body: "Browse verified keys and lock in the best price.",
              },
              {
                title: "Secure checkout",
                body: "Complete payment with instant confirmation.",
              },
              {
                title: "Play instantly",
                body: "Receive your key immediately and start playing.",
              },
            ].map((step) => (
              <div key={step.title} className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>
      </MaxWidthWrapper>
    </main>
  );
};

export default ProductsPage;
