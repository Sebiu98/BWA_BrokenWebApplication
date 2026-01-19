import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "../components/AddToCartButton";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SiteFooter from "../components/SiteFooter";
import { products } from "../../data/products";

//Pagina catalogo con dati mock.
type ProductsPageProps = {
  searchParams?: Promise<{
    search?: string;
    category?: string;
  }>;
};

//Crea il link con query string semplice.
const makeLink = (searchValue: string, categoryValue: string) => {
  let query = "";
  if (searchValue) {
    query = "search=" + encodeURIComponent(searchValue);
  }
  if (categoryValue) {
    if (query) {
      query = query + "&";
    }
    query = query + "category=" + encodeURIComponent(categoryValue);
  }
  if (query) {
    return "/products?" + query;
  }
  return "/products";
};

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  //Legge search e category dalla query.
  const resolvedParams = (await searchParams) ?? {};
  const searchText = resolvedParams.search ? resolvedParams.search.trim() : "";
  const categoryText = resolvedParams.category
    ? resolvedParams.category.trim()
    : "";
  //TODO:vulnerabilita:reflected XSS se la ricerca viene renderizzata senza escaping.

  const searchLower = searchText ? searchText.toLowerCase() : "";

  //Lista categorie unica.
  const categories: string[] = [];
  for (let i = 0; i < products.length; i += 1) {
    const categoryName = products[i].category;
    if (!categories.includes(categoryName)) {
      categories.push(categoryName);
    }
  }
  categories.sort();

  //Filtra i prodotti in base a search e categoria.
  const filteredProducts = [];
  for (let i = 0; i < products.length; i += 1) {
    const product = products[i];
    let matchesSearch = true;
    let matchesCategory = true;

    if (searchLower) {
      const name = product.name.toLowerCase();
      const description = product.description.toLowerCase();
      if (!name.includes(searchLower) && !description.includes(searchLower)) {
        matchesSearch = false;
      }
    }

    if (categoryText) {
      const productCategory = product.category.toLowerCase();
      if (productCategory !== categoryText.toLowerCase()) {
        matchesCategory = false;
      }
    }

    if (matchesSearch && matchesCategory) {
      filteredProducts.push(product);
    }
  }

  //Link rapidi per le categorie.
  const categoryLinks = [];
  const allClassName = categoryText
    ? "rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
    : "rounded-full border border-slate-900 px-3 py-1 text-slate-900 transition";

  categoryLinks.push(
    <Link key="all" href={makeLink(searchText, "")} className={allClassName}>
      All
    </Link>
  );

  for (let i = 0; i < categories.length; i += 1) {
    const categoryName = categories[i];
    const isActive =
      categoryName.toLowerCase() === categoryText.toLowerCase();
    const linkClassName = isActive
      ? "rounded-full border border-slate-900 px-3 py-1 text-slate-900 transition"
      : "rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300";

    categoryLinks.push(
      <Link
        key={categoryName}
        href={makeLink(searchText, categoryName)}
        className={linkClassName}
      >
        {categoryName}
      </Link>
    );
  }

  //Card dei prodotti.
  const productCards = [];
  for (let i = 0; i < filteredProducts.length; i += 1) {
    const product = filteredProducts[i];
    productCards.push(
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
        <p className="mt-2 text-sm text-slate-600">{product.description}</p>
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
          <AddToCartButton
            productId={product.id}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Add to cart
          </AddToCartButton>
        </div>
      </div>
    );
  }

  //Layout principale della pagina.
  return (
    <>
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-16 pt-4 sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-10 xl:pt-5 lg:pb-26 relative overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
              Browse instant game keys
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
              Find the best deals on verified keys, delivered instantly after
              checkout.
            </p>
          </div>

        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2 text-sm">{categoryLinks}</div>
          <form method="get" className="w-full max-w-md">
            {categoryText ? (
              <input type="hidden" name="category" value={categoryText} />
            ) : null}
            <label className="block text-sm font-medium text-slate-700">
              Search
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchText}
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
          </form>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {productCards}
        </div>

        <section id="how" className="mt-16 rounded-2xl bg-white p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Choose your game
              </h3>
              <p className="text-sm text-slate-600">
                Browse verified keys and lock in the best price.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Secure checkout
              </h3>
              <p className="text-sm text-slate-600">
                Complete payment with instant confirmation.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Play instantly
              </h3>
              <p className="text-sm text-slate-600">
                Receive your key immediately and start playing.
              </p>
            </div>
          </div>
        </section>
        </MaxWidthWrapper>
      </main>
      <SiteFooter />
    </>
  );
};

export default ProductsPage;
