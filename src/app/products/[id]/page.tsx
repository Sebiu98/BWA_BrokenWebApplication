import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import ProductComments from "../../components/ProductComments";
import { getProductById, products } from "../../../data/products";

//Pagina dettaglio prodotto.
type ProductPageProps = {
  params: Promise<{ id: string }>;
};

const ProductPage = async ({ params }: ProductPageProps) => {
  //Legge l'id dalla route.
  const { id } = await params;
  const product = getProductById(String(id));

  //Se non esiste, mostra 404.
  if (!product) {
    return notFound();
  }

  //Prodotti correlati semplici.
  const relatedProducts = [];
  for (let i = 0; i < products.length; i += 1) {
    const item = products[i];
    if (item.id === product.id) {
      continue;
    }
    relatedProducts.push(item);
    if (relatedProducts.length === 3) {
      break;
    }
  }

  //Card prodotti correlati.
  const relatedCards = [];
  for (let i = 0; i < relatedProducts.length; i += 1) {
    const item = relatedProducts[i];
    relatedCards.push(
      <Link
        key={item.id}
        href={`/products/${item.id}`}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex h-28 items-center justify-center rounded-xl bg-slate-50">
          <Image
            src={item.image}
            alt={item.name}
            width={120}
            height={120}
            className="h-20 w-20 object-contain"
          />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          {item.name}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          ${item.price.toFixed(2)}
        </p>
      </Link>
    );
  }

  //Layout principale.
  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-10 xl:pt-5 lg:pb-56 relative overflow-hidden">
        <Link href="/products" className="text-sm font-semibold text-slate-600">
          Back to catalog
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-end text-xs text-slate-500">
              <span>{product.platform}</span>
            </div>
            <div className="mt-6 flex h-64 items-center justify-center rounded-xl bg-slate-50">
              <Image
                src={product.image}
                alt={product.name}
                width={220}
                height={220}
                className="h-48 w-48 object-contain"
              />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-base text-slate-600">
              {product.description}
            </p>

            <div className="mt-6 flex items-center gap-6">
              <div>
                {product.originalPrice ? (
                  <p className="text-sm text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </p>
                ) : null}
                <p className="text-2xl font-semibold text-slate-900">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div className="text-sm text-slate-600">
                {product.rating.toFixed(1)} / 5 rating
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                Add to cart
              </button>
              <Link
                href="/cart"
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Go to cart
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                What you get
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Instant digital delivery</li>
                <li>Verified key for the selected platform</li>
                <li>24/7 support if anything goes wrong</li>
              </ul>
            </div>
          </div>
        </div>

        <ProductComments productId={String(id)} />

        <section className="mt-14">
          <h2 className="text-xl font-semibold text-slate-900">
            Related titles
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {relatedCards}
          </div>
        </section>
      </MaxWidthWrapper>
    </main>
  );
};

export default ProductPage;
