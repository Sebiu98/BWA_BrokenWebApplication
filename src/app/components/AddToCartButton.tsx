"use client";

import { type ReactNode } from "react";
import { addCartItem } from "../../lib/cart-storage";

//Bottone semplice per aggiungere un prodotto al carrello.
type AddToCartButtonProps = {
  productId: string;
  className?: string;
  children: ReactNode;
};

const AddToCartButton = ({
  productId,
  className,
  children,
}: AddToCartButtonProps) => {
  const handleClick = () => {
    //TODO:in futuro chiamare un endpoint backend per salvare il carrello.
    addCartItem(productId, 1);
    alert("Added to cart.");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

export default AddToCartButton;
