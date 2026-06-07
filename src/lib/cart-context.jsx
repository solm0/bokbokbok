import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  normalizeStoredSelectedOptions,
  serializeSelectedOptions
} from "./product-options";

const CART_KEY = "bok-cart";
const CartContext = createContext(null);

const LEGACY_GOOD_MIGRATIONS = {
  g4: { id: "g4", option: "m" },
  g5: { id: "g4", option: "l" },
  g6: { id: "g5", option: "m" },
  g7: { id: "g5", option: "l" },
  g8: { id: "g6", option: "m" },
  g9: { id: "g6", option: "l" },
  g10: { id: "g7", option: "m" },
  g11: { id: "g7", option: "l" },
  g12: { id: "g8", option: "m" },
  g13: { id: "g8", option: "l" },
  g14: { id: "g9" }
};

function normalizeCartItem(item) {
  const type = item.type ?? "zine";
  const hasSelectedOptions =
    item?.selectedOptions && typeof item.selectedOptions === "object";

  if (type === "good" && !hasSelectedOptions) {
    const legacy = LEGACY_GOOD_MIGRATIONS[item.id];

    if (legacy) {
      return {
        ...item,
        id: legacy.id,
        selectedOptions:
          Object.keys(normalizeStoredSelectedOptions(item)).length > 0
            ? normalizeStoredSelectedOptions(item)
            : legacy.option
              ? { size: legacy.option }
              : {},
        type
      };
    }
  }

  return {
    ...item,
    type,
    selectedOptions: normalizeStoredSelectedOptions(item)
  };
}

function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(CART_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed
          .map(normalizeCartItem)
          .filter(
            (item, index, items) =>
              items.findIndex(
                (candidate) =>
                  candidate.id === item.id &&
                  candidate.type === item.type &&
                  serializeSelectedOptions(candidate.selectedOptions) ===
                    serializeSelectedOptions(item.selectedOptions)
              ) === index
          )
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
      addItem(id, type = "zine", selectedOptions = {}) {
        setItems((currentItems) => {
          const existing = currentItems.find(
            (item) =>
              item.id === id &&
              item.type === type &&
              serializeSelectedOptions(item.selectedOptions) ===
                serializeSelectedOptions(selectedOptions)
          );
          if (existing) {
            return currentItems;
          }

          return [...currentItems, { id, type, selectedOptions }];
        });
      },
      removeItem(id, type = "zine", selectedOptions = {}) {
        setItems((currentItems) =>
          currentItems.filter(
            (item) =>
              item.id !== id ||
              item.type !== type ||
              serializeSelectedOptions(item.selectedOptions) !==
                serializeSelectedOptions(selectedOptions)
          )
        );
      },
      hasItem(id, type = "zine", selectedOptions = {}) {
        return items.some(
          (item) =>
            item.id === id &&
            item.type === type &&
            serializeSelectedOptions(item.selectedOptions) ===
              serializeSelectedOptions(selectedOptions)
        );
      },
      setItemOptions(id, type = "good", nextSelectedOptions, previousSelectedOptions = {}) {
        setItems((currentItems) => {
          const targetIndex = currentItems.findIndex(
            (item) =>
              item.id === id &&
              item.type === type &&
              serializeSelectedOptions(item.selectedOptions) ===
                serializeSelectedOptions(previousSelectedOptions)
          );

          if (targetIndex === -1) {
            return currentItems;
          }

          const nextItems = [...currentItems];
          nextItems[targetIndex] = {
            ...nextItems[targetIndex],
            selectedOptions: nextSelectedOptions
          };

          return nextItems.filter(
            (item, index, items) =>
              items.findIndex(
                (candidate) =>
                  candidate.id === item.id &&
                  candidate.type === item.type &&
                  serializeSelectedOptions(candidate.selectedOptions) ===
                    serializeSelectedOptions(item.selectedOptions)
              ) === index
          );
        });
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
