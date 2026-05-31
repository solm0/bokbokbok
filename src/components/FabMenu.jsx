import { Link, useLocation } from "react-router-dom";
import { cx } from "./ui";

const menuItems = [
  { label: "HOME", to: "/" },
  { label: "DIG", to: "/dig" },
  { label: "ABOUT", to: "/about" },
  { label: "MAKE ZINE", to: "/zine" },
  { label: "CART", to: "/cart" },
  { label: "INSTAGRAM", href: "https://www.instagram.com/bok3books/" }
];

export default function FabMenu({ visible, cartCount = 0 }) {
  const location = useLocation();

  return (
    <nav
      className={cx(
        "fixed top-3 right-3 left-3 z-[400] flex flex-wrap items-center gap-2.5 px-3 py-2 transition-opacity duration-300 sm:top-8 sm:right-8 sm:left-8 sm:gap-3.5 sm:px-0 sm:py-0",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-label="Primary"
    >
      {menuItems.map((item) => {
        const label = item.to === "/cart" && cartCount > 0 ? `${item.label} ${cartCount}` : item.label;
        const itemClass = "text-sm font-black tracking-[0.02em] no-underline transition-opacity duration-200";

        return item.href ? (
          <a
            key={item.label}
            className={itemClass}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            style={{ opacity: 0.4 }}
          >
            {label}
          </a>
        ) : (
          <Link
            key={item.label}
            className={itemClass}
            to={item.to}
            style={{ opacity: location.pathname === item.to ? 1 : 0.4 }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
