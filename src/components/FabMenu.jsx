import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { label: "HOME", to: "/" },
  { label: "DIG", to: "/dig" },
  { label: "ABOUT", to: "/about" },
  { label: "MAKE ZINE", to: "/zine" },
  { label: "CART", to: "/cart" },
  { label: "INSTAGRAM", href: "https://www.instagram.com/bok3books/" }
];

export default function FabMenu({ open, onToggle, onClose, cartCount = 0 }) {
  const location = useLocation();

  return (
    <div className={`fab-container ${open ? "active" : ""}`}>
      <div className="fab-menu">
        {menuItems.map((item) =>
          item.href ? (
            <a
              key={item.label}
              className="fab-item"
              href={item.href}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              className={`fab-item ${location.pathname === item.to ? "current" : ""}`}
              to={item.to}
              onClick={onClose}
            >
              {item.label}
              {item.to === "/cart" && cartCount > 0 ? (
                <span className="fab-badge">{cartCount}</span>
              ) : null}
            </Link>
          )
        )}
      </div>
      <button type="button" className="fab-main" onClick={onToggle} aria-label="Toggle menu">
        +
      </button>
    </div>
  );
}
