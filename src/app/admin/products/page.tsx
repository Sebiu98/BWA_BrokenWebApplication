"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import { useAuth } from "../../../hooks/useAuth";
import {
  ApiAdminProduct,
  ApiRequestError,
  ApiCategory,
  createApiAdminProduct,
  deleteApiAdminProduct,
  getApiAdminProducts,
  getApiCategories,
  toggleApiAdminProductEnabled,
  updateApiAdminProduct,
} from "../../../lib/api";

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  discount_percentage: string;
  category_id: string;
  is_enabled: boolean;
};

const createInitialForm = (): ProductFormState => ({
  name: "",
  description: "",
  price: "",
  discount_percentage: "0",
  category_id: "",
  is_enabled: true,
});

const formatApiError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiRequestError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

const toFormFromProduct = (product: ApiAdminProduct): ProductFormState => ({
  name: product.name,
  description: product.description,
  price: String(Number(product.price)),
  discount_percentage: String(Number(product.discount_percentage ?? 0)),
  category_id: String(product.category_id),
  is_enabled: Boolean(product.is_enabled),
});

const AdminProductsPage = () => {
  const { user, session, isAdmin, isReady } = useAuth();

  const [products, setProducts] = useState<ApiAdminProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [createForm, setCreateForm] =
    useState<ProductFormState>(createInitialForm());
  const [editForm, setEditForm] =
    useState<ProductFormState>(createInitialForm());

  const canLoad = Boolean(session?.token && isAdmin);

  useEffect(() => {
    if (!session?.token || !isAdmin) {
      setProducts([]);
      setCategories([]);
      return;
    }

    const load = async () => {
      setIsPageLoading(true);
      setErrorMessage("");

      try {
        const [productsData, categoriesData] = await Promise.all([
          getApiAdminProducts(session.token),
          getApiCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setCreateForm((prev) => ({
            ...prev,
            category_id: prev.category_id || String(categoriesData[0].id),
          }));
        }
      } catch (error) {
        setErrorMessage(
          formatApiError(error, "Unable to load admin catalog data."),
        );
        setProducts([]);
        setCategories([]);
      } finally {
        setIsPageLoading(false);
      }
    };

    void load();
  }, [canLoad, isAdmin, session?.token]);

  const categoryOptions = useMemo(() => {
    return categories.map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [categories]);

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.token) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const created = await createApiAdminProduct(session.token, {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        price: Number(createForm.price),
        discount_percentage: Number(createForm.discount_percentage),
        category_id: Number(createForm.category_id),
        is_enabled: createForm.is_enabled,
      });

      setProducts((prev) => [...prev, created.product]);
      setSuccessMessage("Product created successfully.");
      setCreateForm((prev) => ({
        ...createInitialForm(),
        category_id: prev.category_id,
      }));
    } catch (error) {
      setErrorMessage(formatApiError(error, "Failed to create product."));
    } finally {
      setIsSaving(false);
    }
  };

  const beginEdit = (product: ApiAdminProduct) => {
    setEditingProductId(product.id);
    setEditForm(toFormFromProduct(product));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setEditForm(createInitialForm());
  };

  const handleEditSubmit = async (
    event: FormEvent<HTMLFormElement>,
    productId: number,
  ) => {
    event.preventDefault();
    if (!session?.token) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await updateApiAdminProduct(session.token, productId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: Number(editForm.price),
        discount_percentage: Number(editForm.discount_percentage),
        category_id: Number(editForm.category_id),
        is_enabled: editForm.is_enabled,
      });

      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? updated.product : item)),
      );
      setSuccessMessage("Product updated successfully.");
      cancelEdit();
    } catch (error) {
      setErrorMessage(formatApiError(error, "Failed to update product."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnabled = async (productId: number) => {
    if (!session?.token) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await toggleApiAdminProductEnabled(
        session.token,
        productId,
      );
      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? updated.product : item)),
      );
      setSuccessMessage("Product visibility updated.");
    } catch (error) {
      setErrorMessage(
        formatApiError(error, "Failed to update product visibility."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this product? This action cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteApiAdminProduct(session.token, productId);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      setSuccessMessage("Product deleted successfully.");
      if (editingProductId === productId) {
        cancelEdit();
      }
    } catch (error) {
      setErrorMessage(formatApiError(error, "Failed to delete product."));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading products...</p>
        </MaxWidthWrapper>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Admin access required
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Only administrators can view this page.
            </p>
            <Link
              href="/login?next=/admin/products"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="pb-24 pt-4 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-56">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Admin products
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Catalog management
          </h1>
          <p className="text-sm text-slate-600">
            Create, edit, disable, and delete products from the catalog.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Users
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Orders
          </Link>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Create product
          </h2>
          <form
            onSubmit={handleCreateSubmit}
            className="mt-4 grid gap-4 md:grid-cols-2"
          >
            <label className="text-sm text-slate-700">
              Name
              <input
                required
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-slate-700">
              Price
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={createForm.price}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    price: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-slate-700">
              Discount %
              <input
                required
                type="number"
                min="0"
                max="90"
                step="1"
                value={createForm.discount_percentage}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    discount_percentage: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              Description
              <textarea
                required
                rows={3}
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-slate-700">
              Category
              <select
                required
                value={createForm.category_id}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    category_id: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={createForm.is_enabled}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    is_enabled: event.target.checked,
                  }))
                }
              />
              Visible to users
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSaving || isPageLoading || categories.length === 0}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                Create product
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 space-y-4">
          {isPageLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Loading admin catalog...
            </div>
          ) : null}

          {!isPageLoading && products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              No products found.
            </div>
          ) : null}

          {!isPageLoading
            ? products.map((item) => {
                const isEditing = editingProductId === item.id;
                const formState = isEditing
                  ? editForm
                  : toFormFromProduct(item);

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.name}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.is_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {item.description}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      Base: ${Number(item.price).toFixed(2)} • Discount:{" "}
                      {item.discount_percentage ?? 0}% • Final: $
                      {(
                        Number(item.price) *
                        (1 - Number(item.discount_percentage ?? 0) / 100)
                      ).toFixed(2)}{" "}
                      • {item.category?.name ?? "Unknown category"}
                    </p>

                    {isEditing ? (
                      <form
                        onSubmit={(event) => handleEditSubmit(event, item.id)}
                        className="mt-4 grid gap-3 md:grid-cols-2"
                      >
                        <label className="text-sm text-slate-700">
                          Name
                          <input
                            required
                            value={formState.name}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-sm text-slate-700">
                          Price
                          <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={formState.price}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                price: event.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-sm text-slate-700">
                          Discount %
                          <input
                            required
                            type="number"
                            min="0"
                            max="90"
                            step="1"
                            value={formState.discount_percentage}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                discount_percentage: event.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-sm text-slate-700 md:col-span-2">
                          Description
                          <textarea
                            required
                            rows={3}
                            value={formState.description}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-sm text-slate-700">
                          Category
                          <select
                            required
                            value={formState.category_id}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                category_id: event.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          >
                            {categoryOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={formState.is_enabled}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                is_enabled: event.target.checked,
                              }))
                            }
                          />
                          Visible to users
                        </label>
                        <div className="md:col-span-2 flex gap-2">
                          <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => beginEdit(item)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleEnabled(item.id)}
                          disabled={isSaving}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          {item.is_enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isSaving}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </article>
                );
              })
            : null}
        </section>
      </MaxWidthWrapper>
    </main>
  );
};

export default AdminProductsPage;
