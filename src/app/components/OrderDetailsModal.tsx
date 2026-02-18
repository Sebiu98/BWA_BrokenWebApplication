"use client";

import { type ApiOrder } from "../../lib/api";

type OrderDetailsModalProps = {
  isOpen: boolean;
  order: ApiOrder | null;
  onClose: () => void;
};

const normalizeStatus = (
  status: string,
): "pending" | "completed" | "cancelled" => {
  if (status === "completed" || status === "cancelled") {
    return status;
  }
  return "pending";
};

const OrderDetailsModal = ({ isOpen, order, onClose }: OrderDetailsModalProps) => {
  if (!isOpen || !order) {
    return null;
  }

  const normalizedStatus = normalizeStatus(order.status);
  const statusClassName =
    normalizedStatus === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : normalizedStatus === "cancelled"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Order details"
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Order ord-{order.id}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {order.created_at
                ? new Date(order.created_at).toLocaleString()
                : "Unknown date"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusClassName}`}
            >
              {normalizedStatus}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {order.items.map((item) => {
            const quantity = item.quantity;
            const paidUnitPrice = Number(item.unit_price);
            const originalUnitPrice = Number(item.product?.price ?? item.unit_price);
            const linePaidTotal = paidUnitPrice * quantity;
            const lineOriginalTotal = originalUnitPrice * quantity;
            const hasDiscount = originalUnitPrice > paidUnitPrice;
            const discountPercentage = Number(
              item.product?.discount_percentage ?? 0,
            );
            const productName = item.product
              ? item.product.name
              : `Product #${item.product_id}`;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {productName}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">Qty: {quantity}</p>
                  </div>
                  <div className="text-right">
                    {hasDiscount ? (
                      <p className="text-xs text-slate-400 line-through">
                        ${lineOriginalTotal.toFixed(2)}
                      </p>
                    ) : null}
                    <p className="text-sm font-semibold text-slate-900">
                      ${linePaidTotal.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Unit: ${paidUnitPrice.toFixed(2)}
                    </p>
                    {hasDiscount ? (
                      <p className="text-xs font-semibold text-emerald-700">
                        -{discountPercentage}%
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-right text-base font-semibold text-slate-900">
            Total paid: ${Number(order.total_amount).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
