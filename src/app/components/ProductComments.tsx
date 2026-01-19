"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { type ProductComment, getCommentsByProductId } from "../../data/comments";
import { useAuth } from "../../hooks/useAuth";

type ProductCommentsProps = {
  productId: string;
};

//Lista commenti per un prodotto.
const ProductComments = ({ productId }: ProductCommentsProps) => {
  //TODO:vulnerabilita:stored XSS nei commenti se salvati senza sanitizzazione.
  //Dati user per mostrare il form solo se loggato.
  const { user, isReady } = useAuth();
  const comments = getCommentsByProductId(productId);
  const [localComments, setLocalComments] = useState<ProductComment[]>([]);
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");

  const allComments = [...comments, ...localComments];
  const items = [];

  for (let i = 0; i < allComments.length; i += 1) {
    const comment = allComments[i];
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      alert("Please write a comment.");
      return;
    }

    const nextComment: ProductComment = {
      id: "c-local-" + Date.now(),
      productId,
      name: user.name,
      rating: Number(rating),
      text: trimmedText,
      date: new Date().toISOString().slice(0, 10),
    };

    //TODO:salvare il commento nel backend.
    setLocalComments([...localComments, nextComment]);
    setText("");
    setRating("5");
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-slate-900">
        User reviews
      </h2>
      {isReady ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Add your review
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Share your experience with other customers.
                </p>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Rating
                <select
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Bad</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Comment
                <textarea
                  rows={4}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Write your review here"
                  className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Submit review
              </button>
            </form>
          ) : (
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                Want to leave a review?
              </p>
              <p className="mt-1">
                Please{" "}
                <Link
                  href={`/login?next=/products/${productId}`}
                  className="font-semibold text-slate-900"
                >
                  sign in
                </Link>{" "}
                to comment on this product.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading comment form...
        </div>
      )}
      <div className="mt-6 grid gap-4">{items}</div>
      {items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No comments available for this product.
        </div>
      ) : null}
    </section>
  );
};

export default ProductComments;
