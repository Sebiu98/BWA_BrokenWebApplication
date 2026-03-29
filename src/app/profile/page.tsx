"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import OrderDetailsModal from "../components/OrderDetailsModal";
import { useAuth } from "../../hooks/useAuth";
import { readSession, writeSession } from "../../lib/auth-session";
import {
  getApiMyOrders,
  meApiAuth,
  updateApiProfile,
  type ApiAuthUser,
  type ApiOrder,
  type ProfileUpdatePayload,
} from "../../lib/api";

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

const normalizeStatus = (
  status: string,
): "pending" | "completed" | "cancelled" => {
  if (status === "completed" || status === "cancelled") {
    return status;
  }
  return "pending";
};

const ProfilePage = () => {
  //Legge utente dalla sessione.
  const { user, session, isReady } = useAuth();
  const [profileDetails, setProfileDetails] = useState<ApiAuthUser | null>(
    null,
  );
  const [purchaseHistory, setPurchaseHistory] = useState<ApiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [isOrdersReady, setIsOrdersReady] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFormError, setProfileFormError] = useState("");
  const [profileFormSuccess, setProfileFormSuccess] = useState("");

  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCurrentPassword, setEditCurrentPassword] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirmation, setEditPasswordConfirmation] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.token) {
        setProfileDetails(null);
        setIsProfileReady(true);
        return;
      }

      try {
        const me = await meApiAuth(session.token);
        setProfileDetails(me);
      } catch {
        setProfileDetails(null);
      } finally {
        setIsProfileReady(true);
      }
    };

    void loadProfile();
  }, [session?.token]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!session?.token) {
        setPurchaseHistory([]);
        setIsOrdersReady(true);
        return;
      }

      try {
        const apiOrders = await getApiMyOrders(session.token);
        setPurchaseHistory(apiOrders);
      } catch {
        setPurchaseHistory([]);
      } finally {
        setIsOrdersReady(true);
      }
    };

    void loadOrders();
  }, [session?.token]);

  useEffect(() => {
    if (!profileDetails) {
      return;
    }

    setEditUsername(profileDetails.username ?? "");
    setEditEmail(profileDetails.email ?? "");
  }, [profileDetails]);

  const resetPasswordFields = () => {
    setEditCurrentPassword("");
    setEditPassword("");
    setEditPasswordConfirmation("");
  };

  const handleToggleEdit = () => {
    if (isEditingProfile && profileDetails) {
      setEditUsername(profileDetails.username ?? "");
      setEditEmail(profileDetails.email ?? "");
      resetPasswordFields();
      setProfileFormError("");
    }

    setProfileFormSuccess("");
    setIsEditingProfile((current) => !current);
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token || !profileDetails) {
      setProfileFormError("You need to be logged in to update profile.");
      return;
    }

    const payload: ProfileUpdatePayload = {};
    const nextUsername = editUsername.trim();
    const nextEmail = editEmail.trim();

    setProfileFormError("");
    setProfileFormSuccess("");

    if (!nextUsername) {
      setProfileFormError("Username is required.");
      return;
    }

    if (!nextEmail) {
      setProfileFormError("Email is required.");
      return;
    }

    if (nextUsername !== profileDetails.username) {
      payload.username = nextUsername;
    }

    if (nextEmail !== profileDetails.email) {
      payload.email = nextEmail;
    }

    const wantsPasswordUpdate =
      editCurrentPassword.length > 0 ||
      editPassword.length > 0 ||
      editPasswordConfirmation.length > 0;

    if (wantsPasswordUpdate) {
      if (!editCurrentPassword) {
        setProfileFormError("Current password is required to set a new password.");
        return;
      }

      if (editPassword.length < 8) {
        setProfileFormError("New password must be at least 8 characters.");
        return;
      }

      if (editPassword !== editPasswordConfirmation) {
        setProfileFormError("Password confirmation does not match.");
        return;
      }

      payload.current_password = editCurrentPassword;
      payload.password = editPassword;
      payload.password_confirmation = editPasswordConfirmation;
    }

    if (Object.keys(payload).length === 0) {
      setProfileFormSuccess("No changes to save.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await updateApiProfile(session.token, payload);
      setProfileDetails(response.user);
      setProfileFormSuccess(response.message || "Profile updated successfully.");
      resetPasswordFields();
      setIsEditingProfile(false);

      const localSession = readSession();
      if (localSession?.token === session.token) {
        writeSession({
          token: localSession.token,
          user: {
            name: response.user.username || localSession.user.name,
            email: response.user.email,
            role: response.user.role === "admin" ? "admin" : "user",
          },
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("bwa-auth-change"));
        }
      }
    } catch (error) {
      setProfileFormError(toErrorMessage(error, "Failed to update profile."));
    } finally {
      setIsSavingProfile(false);
    }
  };

  //Se la sessione non e pronta, mostra un testo semplice.
  if (!isReady || !isProfileReady || !isOrdersReady) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="px-6 py-16 lg:px-0">
          <p className="text-sm text-slate-600">Loading profile...</p>
        </MaxWidthWrapper>
      </main>
    );
  }

  //Se non e loggato, mostra messaggio.
  if (!user) {
    return (
      <main className="bg-slate-50">
        <MaxWidthWrapper className="px-6 py-16 lg:px-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
            <p className="mt-2 text-sm text-slate-600">
              Please log in to view your profile.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </MaxWidthWrapper>
      </main>
    );
  }

  const displayName = profileDetails?.username || user.name;
  const fullName = [profileDetails?.name, profileDetails?.surname]
    .filter(Boolean)
    .join(" ");
  const avatar = profileDetails?.avatar || "/avatars/avatar-01.jpg";
  const memberSince = profileDetails?.created_at
    ? new Date(profileDetails.created_at).toLocaleDateString()
    : "-";

  let totalSaved = 0;
  for (let i = 0; i < purchaseHistory.length; i += 1) {
    const order = purchaseHistory[i];
    const normalizedStatus = normalizeStatus(order.status);
    if (normalizedStatus !== "completed") {
      continue;
    }

    for (let j = 0; j < order.items.length; j += 1) {
      const item = order.items[j];
      const originalUnitPrice = Number(item.product?.price ?? item.unit_price);
      const paidUnitPrice = Number(item.unit_price);
      const savedPerUnit =
        originalUnitPrice > paidUnitPrice ? originalUnitPrice - paidUnitPrice : 0;
      totalSaved += savedPerUnit * item.quantity;
    }
  }

  //Prepara le card per ordine completo.
  const purchaseCards = [];
  for (let i = 0; i < purchaseHistory.length; i += 1) {
    const order = purchaseHistory[i];
    const normalizedStatus = normalizeStatus(order.status);
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleDateString()
      : "-";
    const orderTotal = Number(order.total_amount);
    let totalItems = 0;
    for (let j = 0; j < order.items.length; j += 1) {
      totalItems += order.items[j].quantity;
    }

    const statusClassName =
      normalizedStatus === "completed"
        ? "bg-emerald-100 text-emerald-700"
        : normalizedStatus === "cancelled"
          ? "bg-red-100 text-red-700"
          : "bg-amber-100 text-amber-700";

    purchaseCards.push(
      <div
        key={order.id}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">
            Order ord-{order.id}
          </h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusClassName}`}
          >
            {normalizedStatus}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1 text-sm text-slate-600">
            <p>Date: {orderDate}</p>
            <p>Items: {totalItems}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              Total: ${orderTotal.toFixed(2)}
            </p>
            <button
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View details
            </button>
          </div>
        </div>
      </div>,
    );
  }

  return (
    <main className="bg-slate-50">
      <MaxWidthWrapper className="px-6 py-16 lg:px-0">
        <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <button
            type="button"
            onClick={handleToggleEdit}
            className="absolute right-6 top-6 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {isEditingProfile ? "Cancel" : "Edit profile"}
          </button>

          <div className="flex flex-col items-center text-center">
            <Image
              src={avatar}
              alt={displayName}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-slate-100"
            />
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              {displayName}
            </h1>
            {fullName ? (
              <p className="mt-1 text-sm text-slate-600">{fullName}</p>
            ) : null}
            <p className="mt-2 text-sm text-slate-600">
              Member since: {memberSince}
            </p>
          </div>

          {profileFormError ? (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {profileFormError}
            </p>
          ) : null}

          {profileFormSuccess ? (
            <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {profileFormSuccess}
            </p>
          ) : null}

          {isEditingProfile ? (
            <form className="mt-6 space-y-4" onSubmit={handleSaveProfile}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Username
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(event) => setEditUsername(event.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 transition focus:ring"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Email
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(event) => setEditEmail(event.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 transition focus:ring"
                    required
                  />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Change password (optional)</p>
                <p className="mt-1 text-xs text-slate-600">
                  To update password, provide current password and confirm the new one.
                </p>

                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Current password
                    <input
                      type="password"
                      value={editCurrentPassword}
                      onChange={(event) => setEditCurrentPassword(event.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 transition focus:ring"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    New password
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(event) => setEditPassword(event.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 transition focus:ring"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Confirm new password
                    <input
                      type="password"
                      value={editPasswordConfirmation}
                      onChange={(event) =>
                        setEditPasswordConfirmation(event.target.value)
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 transition focus:ring"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingProfile ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <section className="mt-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Your savings
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              You saved ${totalSaved.toFixed(2)} by shopping on BWA.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="px-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Purchase history
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Keys are valid for 30 days from order confirmation.
            </p>
          </div>

          {purchaseHistory.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              No purchases yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">{purchaseCards}</div>
          )}
        </section>
      </MaxWidthWrapper>
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        canViewKeys
      />
    </main>
  );
};

export default ProfilePage;

