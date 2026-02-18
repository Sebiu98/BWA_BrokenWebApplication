"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import {
  createApiProductComment,
  deleteApiComment,
  getApiProductComments,
  type ApiComment,
} from "../../lib/api";

type ProductCommentsProps = {
  productId: string;
};

//Lista commenti per un prodotto.
const ProductComments = ({ productId }: ProductCommentsProps) => {
  //TODO:vulnerabilita:stored XSS nei commenti se salvati senza sanitizzazione.
  //Dati user per mostrare il form solo se loggato.
  const { user, session, isAdmin, isReady } = useAuth();
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [isCommentsReady, setIsCommentsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");

  useEffect(() => {
    const loadComments = async () => {
      try {
        const apiComments = await getApiProductComments(productId);
        setComments(apiComments);
      } catch {
        setComments([]);
      } finally {
        setIsCommentsReady(true);
      }
    };

    void loadComments();
  }, [productId]);

  const handleDeleteComment = async (commentId: number) => {
    if (!session?.token || !isAdmin) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      await deleteApiComment(session.token, commentId);
      setComments((prev) => prev.filter((item) => item.id !== commentId));
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Comment delete failed.");
      }
    } finally {
      setDeletingCommentId(null);
    }
  };

  const items = [];

  for (let i = 0; i < comments.length; i += 1) {
    const comment = comments[i];
    const authorName =
      comment.user?.username ||
      [comment.user?.name, comment.user?.surname].filter(Boolean).join(" ") ||
      `User #${comment.user_id}`;
    const commentDate = comment.created_at
      ? new Date(comment.created_at).toISOString().slice(0, 10)
      : "-";
    items.push(
      <div
        key={comment.id}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{authorName}</span>
          <span>{commentDate}</span>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Rating: {comment.rating} / 5
        </div>
        <p className="mt-3 text-sm text-slate-700">{comment.content}</p>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => handleDeleteComment(comment.id)}
            disabled={deletingCommentId === comment.id}
            className="mt-3 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {deletingCommentId === comment.id
              ? "Removing..."
              : "Remove comment"}
          </button>
        ) : null}
      </div>,
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!user || !session?.token) {
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      alert("Please write a comment.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createApiProductComment(session.token, productId, {
        content: trimmedText,
        rating: Number(rating),
      });
      setComments((prev) => [response.comment, ...prev]);
      setText("");
      setRating("5");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Comment submit failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-slate-900">User reviews</h2>
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
                disabled={isSubmitting}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {isSubmitting ? "Submitting..." : "Submit review"}
              </button>
              {errorMessage ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}
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
      {isCommentsReady ? (
        <div className="mt-6 grid gap-4">{items}</div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading comments...
        </div>
      )}
      {items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No comments available for this product.
        </div>
      ) : null}
    </section>
  );
};

export default ProductComments;
