import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "bok-cart";
const CartContext = createContext(null);

function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(CART_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          ...item,
          type: item.type ?? "zine"
        }))
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem(id, type = "zine") {
        setItems((currentItems) => {
          const existing = currentItems.find((item) => item.id === id && item.type === type);
          if (existing) {
            return currentItems;
          }

          return [...currentItems, { id, type }];
        });
      },
      removeItem(id, type = "zine") {
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== id || item.type !== type)
        );
      },
      hasItem(id, type = "zine") {
        return items.some((item) => item.id === id && item.type === type);
      },
      clearCart() {
        setItems([]);
      }
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart must be used within CartProvider");
  }

  return value;
}
