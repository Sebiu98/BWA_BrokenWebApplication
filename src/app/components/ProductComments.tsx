"use client";

import { getCommentsByProductId } from "../../data/comments";

type ProductCommentsProps = {
  productId: string;
};

//Lista commenti per un prodotto.
const ProductComments = ({ productId }: ProductCommentsProps) => {
  //TODO:qui useremo commenti reali e vulnerabilita (es.XSS) in fase 2.
  const comments = getCommentsByProductId(productId);
  const items = [];

  for (let i = 0; i < comments.length; i += 1) {
    const comment = comments[i];
    items.push(
      <div
        key={comment.id}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{comment.name}</span>
          <span>{comment.date}</span>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Rating: {comment.rating} / 5
        </div>
        <p className="mt-3 text-sm text-slate-700">{comment.text}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        No comments available for this product.
      </div>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-slate-900">
        User reviews
      </h2>
      <div className="mt-6 grid gap-4">{items}</div>
    </section>
  );
};

export default ProductComments;
