import { Link, useLocation } from "react-router-dom";

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
    <nav className={`site-nav ${visible ? "visible" : ""}`} aria-label="Primary">
      {menuItems.map((item) => {
        const label = item.to === "/cart" && cartCount > 0 ? `${item.label} ${cartCount}` : item.label;

        return item.href ? (
          <a
            key={item.label}
            className="site-nav-link"
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
            className="site-nav-link"
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
