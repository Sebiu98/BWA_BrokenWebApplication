//Tipo base per il carrello.
export type CartItem = {
  productId: string;
  quantity: number;
};

//Chiave usata in localStorage.
const CART_STORAGE_KEY = "bwa_cart_items";

//Notifica cambio carrello per aggiornare la UI.
const notifyCartChange = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event("bwa-cart-change"));
};

//Legge il carrello dal browser (solo client).
export function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const cleaned: CartItem[] = [];
    for (let i = 0; i < parsed.length; i += 1) {
      const item = parsed[i];
      if (!item || typeof item.productId !== "string") {
        continue;
      }
      const quantity = Number(item.quantity);
      if (!quantity || quantity < 1) {
        continue;
      }
      cleaned.push({ productId: item.productId, quantity });
    }
    return cleaned;
  } catch {
    return [];
  }
}

//Scrive il carrello nel browser.
export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  notifyCartChange();
}

//Aggiunge un prodotto al carrello.
export function addCartItem(productId: string, quantity = 1) {
  const items = readCart();
  let found = false;

  for (let i = 0; i < items.length; i += 1) {
    if (items[i].productId === productId) {
      items[i].quantity += quantity;
      found = true;
      break;
    }
  }

  if (!found) {
    items.push({ productId, quantity });
  }

  writeCart(items);
}

//Aggiorna la quantita di un prodotto.
export function updateCartItem(productId: string, quantity: number) {
  const items = readCart();
  const nextItems: CartItem[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item.productId === productId) {
      if (quantity > 0) {
        nextItems.push({ productId, quantity });
      }
    } else {
      nextItems.push(item);
    }
  }

  writeCart(nextItems);
}

//Rimuove un prodotto dal carrello.
export function removeCartItem(productId: string) {
  const items = readCart();
  const nextItems: CartItem[] = [];

  for (let i = 0; i < items.length; i += 1) {
    if (items[i].productId !== productId) {
      nextItems.push(items[i]);
    }
  }

  writeCart(nextItems);
}

//Svuota il carrello.
export function clearCart() {
  writeCart([]);
}
