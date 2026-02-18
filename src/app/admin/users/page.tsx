"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import { useAuth } from "../../../hooks/useAuth";
import {
  ApiAuthUser,
  ApiRequestError,
  deleteApiUser,
  getApiUsers,
  toggleApiUserActive,
  updateApiUser,
} from "../../../lib/api";

type UserFormState = {
  username: string;
  name: string;
  surname: string;
  email: string;
  role: "user" | "admin";
};

const toForm = (user: ApiAuthUser): UserFormState => ({
  username: user.username,
  name: user.name,
  surname: user.surname,
  email: user.email,
  role: user.role === "admin" ? "admin" : "user",
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

const AdminUsersPage = () => {
  const { user, session, isAdmin, isReady } = useAuth();

  const [users, setUsers] = useState<ApiAuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UserFormState | null>(null);

  const canLoad = Boolean(session?.token && isAdmin);

  useEffect(() => {
    if (!session?.token || !isAdmin) {
      setUsers([]);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getApiUsers(session.token);
        setUsers(data);
      } catch (error) {
        setUsers([]);
        setErrorMessage(formatApiError(error, "Unable to load users."));
      } finally {
        setIsLoading(false);
      }
    };

    if (canLoad) {
      void load();
    }
  }, [canLoad, isAdmin, session?.token]);

  const activeAdminsCount = useMemo(() => {
    return users.filter(
      (item) => item.role === "admin" && item.is_active !== false,
    ).length;
  }, [users]);

  const beginEdit = (target: ApiAuthUser) => {
    setEditingUserId(target.id);
    setEditForm(toForm(target));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm(null);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token || !editingUserId || !editForm) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await updateApiUser(session.token, editingUserId, {
        username: editForm.username.trim(),
        name: editForm.name.trim(),
        surname: editForm.surname.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      });

      setUsers((prev) =>
        prev.map((item) => (item.id === editingUserId ? response.user : item)),
      );
      setSuccessMessage("User updated successfully.");
      cancelEdit();
    } catch (error) {
      setErrorMessage(formatApiError(error, "Failed to update user."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (target: ApiAuthUser) => {
    if (!session?.token) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await toggleApiUserActive(session.token, target.id);
      setUsers((prev) =>
        prev.map((item) => (item.id === target.id ? response.user : item)),
      );
      setSuccessMessage("User status updated.");
    } catch (error) {
      setErrorMessage(formatApiError(error, "Failed to update user status."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (target: ApiAuthUser) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm(
      `Delete user @${target.username}? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteApiUser(session.token, target.id);
      setUsers((prev) => prev.filter((item) => item.id !== target.id));
      setSuccessMessage("User deleted successfully.");
      if (editingUserId === target.id) {
        cancelEdit();
      }
    } catch (error) {
      setErrorMessage(formatApiError(error, "Failed to delete user."));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="pb-24 pt-8">
          <p className="text-sm text-slate-600">Loading users...</p>
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
              href="/login?next=/admin/users"
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
            Admin users
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Manage accounts
          </h1>
          <p className="text-sm text-slate-600">
            Edit user data and roles, disable accounts, or remove them from the
            platform.
          </p>
          <p className="text-xs text-slate-500">
            Active admins: {activeAdminsCount}
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
            href="/admin/products"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
          >
            Products
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

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading users...
          </div>
        ) : null}

        {!isLoading && users.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No users found.
          </div>
        ) : null}

        {!isLoading ? (
          <div className="mt-8 space-y-4">
            {users.map((item) => {
              const isEditing = editingUserId === item.id;
              const isSelf = user.email === item.email;
              const displayName = `${item.name} ${item.surname}`.trim();

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                        <Image
                          src={item.avatar || "/avatars/avatar-01.jpg"}
                          alt={displayName}
                          width={64}
                          height={64}
                          className="h-16 w-16 object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {displayName}
                        </h2>
                        <p className="text-xs text-slate-500">
                          @{item.username}
                        </p>
                        <p className="text-sm text-slate-600">{item.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {item.role.toUpperCase()}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.is_active === false
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {item.is_active === false ? "Disabled" : "Active"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => beginEdit(item)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          disabled={isSaving}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          {item.is_active === false ? "Enable" : "Disable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={isSaving}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {isEditing && editForm ? (
                    <form
                      onSubmit={handleEditSubmit}
                      className="mt-4 grid gap-3 md:grid-cols-2"
                    >
                      <label className="text-sm text-slate-700">
                        Username
                        <input
                          required
                          value={editForm.username}
                          onChange={(event) =>
                            setEditForm((prev) =>
                              prev
                                ? { ...prev, username: event.target.value }
                                : prev,
                            )
                          }
                          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-sm text-slate-700">
                        Email
                        <input
                          required
                          type="email"
                          value={editForm.email}
                          onChange={(event) =>
                            setEditForm((prev) =>
                              prev
                                ? { ...prev, email: event.target.value }
                                : prev,
                            )
                          }
                          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-sm text-slate-700">
                        Name
                        <input
                          required
                          value={editForm.name}
                          onChange={(event) =>
                            setEditForm((prev) =>
                              prev
                                ? { ...prev, name: event.target.value }
                                : prev,
                            )
                          }
                          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-sm text-slate-700">
                        Surname
                        <input
                          required
                          value={editForm.surname}
                          onChange={(event) =>
                            setEditForm((prev) =>
                              prev
                                ? { ...prev, surname: event.target.value }
                                : prev,
                            )
                          }
                          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-sm text-slate-700 md:col-span-2">
                        Role
                        <select
                          value={editForm.role}
                          onChange={(event) =>
                            setEditForm((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    role:
                                      event.target.value === "admin"
                                        ? "admin"
                                        : "user",
                                  }
                                : prev,
                            )
                          }
                          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
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
                        {isSelf ? (
                          <span className="self-center text-xs text-slate-500">
                            You are editing your own account.
                          </span>
                        ) : null}
                      </div>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </MaxWidthWrapper>
    </main>
  );
};

export default AdminUsersPage;
