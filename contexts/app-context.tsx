import { useState } from "react";
import { createContext } from "vm";

export const CartContext =
  createContext();

import { ReactNode } from "react";

function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState([]);
  return (
    <CartContext.Provider
      value={{ cart, setCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
