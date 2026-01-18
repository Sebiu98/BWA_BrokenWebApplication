//Elemento del carrello dentro un ordine.
export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

//Ordine mock per lo storico.
export type Order = {
  id: string;
  userEmail: string;
  date: string;
  total: number;
  status: string;
  items: OrderItem[];
};

//Lista ordini mock.
export const orders: Order[] = [
  {
    id: "ord-1001",
    userEmail: "user@bwa.local",
    date: "2025-01-05",
    total: 58.98,
    status: "Completed",
    items: [
      {
        productId: "1",
        name: "Elden Ring - Deluxe",
        price: 38.99,
        quantity: 1,
      },
      {
        productId: "5",
        name: "Shadow Protocol",
        price: 19.99,
        quantity: 1,
      },
    ],
  },
  {
    id: "ord-1002",
    userEmail: "user@bwa.local",
    date: "2025-01-11",
    total: 24.99,
    status: "Completed",
    items: [
      {
        productId: "2",
        name: "Cyber Sentinel 2077",
        price: 24.99,
        quantity: 1,
      },
    ],
  },
  {
    id: "ord-2001",
    userEmail: "admin@bwa.local",
    date: "2025-01-03",
    total: 17.99,
    status: "Completed",
    items: [
      {
        productId: "7",
        name: "Tactics Forge",
        price: 17.99,
        quantity: 1,
      },
    ],
  },
];
