import { Link, useLocation } from "react-router-dom";
import { cx } from "./ui";

const menuItems = [
  { label: "About Us", to: "/about" },
  { label: "Goods+Apparel", to: "/goods" },
  { label: "Digging Zone", to: "/dig" },
  { label: "DIY", to: "/zine" },
];

export default function FabMenu({ visible, cartCount = 0 }) {
  const location = useLocation();

  return (
    <nav
      className={cx(
        "fixed z-400 flex items-start justify-between transition-opacity duration-300 sm:top-3 sm:right-3 sm:left-3 sm:gap-3.5 sm:px-0 sm:py-0",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-label="Primary"
    >
      <Link
        className="flex flex-col left-0 text-sm transition-opacity duration-200"
        to={'/'}
      >
        <span>BOK³</span>
        <span>Zine</span>
      </Link>
      <div className="flex items-center gap-10">
        {menuItems.map((item) => {
          const label = item.to === "/cart" && cartCount > 0 ? `${item.label} ${cartCount}` : item.label;
          

          return item.href ? (
            <a
              key={item.label}
              className="text-sm transition-opacity duration-200"
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
              className={`
                text-sm transition-opacity duration-200 transition-opacity
                ${location.pathname === item.to ? 'opacity-100' : 'opacity-40 hover:opacity-80'}
              `}
              to={item.to}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <Link
        className="flex flex-col left-0 text-sm transition-opacity duration-200 hover:opacity-50 transition-opacity"
        to={'/cart'}
      >
        <img src="/images/cart.png" className="w-12" />
      </Link>
    </nav>
  );
}
