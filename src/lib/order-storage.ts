import { type CartItem } from "./cart-storage";

//Riepilogo ordine salvato in locale.
export type OrderSummary = {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  userEmail: string;
};

//Chiave usata in localStorage.
const ORDER_STORAGE_KEY = "bwa_last_order";

//Legge l'ultimo ordine dal browser.
export function readLastOrder(): OrderSummary | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as OrderSummary;
    if (!parsed?.id || !parsed?.items || !parsed?.total || !parsed?.date) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

//Salva l'ultimo ordine nel browser.
export function writeLastOrder(order: OrderSummary) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
}

//Pulisce l'ultimo ordine.
export function clearLastOrder() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ORDER_STORAGE_KEY);
}
