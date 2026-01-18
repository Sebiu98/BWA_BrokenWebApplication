//Tipo commento collegato a un prodotto.
export type ProductComment = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  text: string;
  date: string;
};

//Commenti mock per i prodotti.
export const productComments: ProductComment[] = [
  {
    id: "c-1",
    productId: "1",
    name: "Luca P.",
    rating: 5,
    text: "Key arrived instantly, everything worked perfectly.",
    date: "2025-01-12",
  },
  {
    id: "c-2",
    productId: "1",
    name: "Giulia V.",
    rating: 4,
    text: "Good price and easy installation.",
    date: "2025-01-10",
  },
  {
    id: "c-3",
    productId: "2",
    name: "Marco R.",
    rating: 4,
    text: "Great discount and fast delivery.",
    date: "2025-01-08",
  },
  {
    id: "c-4",
    productId: "3",
    name: "Sara C.",
    rating: 3,
    text: "All good, but I wanted more details.",
    date: "2025-01-07",
  },
];

//Ritorna i commenti per un prodotto specifico.
export const getCommentsByProductId = (productId: string) => {
  const list: ProductComment[] = [];
  for (let i = 0; i < productComments.length; i += 1) {
    const comment = productComments[i];
    if (comment.productId === productId) {
      list.push(comment);
    }
  }
  return list;
};
