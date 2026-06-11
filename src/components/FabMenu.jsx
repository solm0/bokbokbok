import { Link, useLocation } from "react-router-dom";
import { cx } from "./ui";
import { useI18n } from "../lib/i18n";

const menuItems = [
  { key: "nav.about", to: "/about" },
  { key: "nav.digging", to: "/dig" },
  { key: "nav.goods", to: "/goods" },
  { key: "nav.font", to: "/font" },
  { key: "nav.diy", to: "/zine" }
];

function BrandTrigger({ onClick, active, className = "" }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      className={cx(
        "pointer-events-auto flex flex-col leading-none transition-opacity duration-200 md:text-sm",
        active ? "opacity-100" : "opacity-80",
        className
      )}
      onClick={onClick}
      aria-expanded={active}
      aria-label={active ? t("nav.closeMenu") : t("nav.openMenu")}
    >
      <span>BOK³</span>
      <span>Zine</span>
    </button>
  );
}

export default function FabMenu({
  desktopVisible,
  mobileOpen,
  cartCount = 0,
  onToggle,
  onClose,
}) {
  const location = useLocation();
  const { t } = useI18n();

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-400 flex justify-center md:hidden">
        <BrandTrigger onClick={onToggle} active={mobileOpen} />
      </div>

      <div
        className={cx(
          "fixed inset-0 z-300 flex items-center justify-center bg-white/50 backdrop-blur-xl transition-opacity duration-300 md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
        onClick={onClose}
      >
        <nav
          className="flex flex-col items-center justify-center gap-6 px-6 font-bok text-[20px]!"
          aria-label={t("nav.primaryMobile")}
          onClick={(event) => event.stopPropagation()}
        >
          {menuItems.map((item) => (
            <Link
              key={item.key}
              className={cx(
                "text-center text-2xl transition-opacity duration-200",
                location.pathname === item.to ? "opacity-100" : "opacity-60",
                item.to === '/zine' ? 'hidden' : 'block'
              )}
              to={item.to}
              onClick={onClose}
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            className="mt-2 flex flex-col items-center text-sm transition-opacity duration-200 hover:opacity-70"
            to="/cart"
            onClick={onClose}
            aria-label={t("nav.cart")}
          >
            <img src="/images/cart.png" className="w-12" />
            {/* {cartCount > 0 ? <span className="mt-2">({cartCount})</span> : null} */}
          </Link>
        </nav>
      </div>

      <nav
        className={cx(
          "fixed top-3 right-3 left-3 z-400 hidden items-start justify-between gap-3.5 px-0 py-0 font-bok text-[40px]! transition-opacity duration-300 md:flex",
          desktopVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label={t("nav.primary")}
      >
        <Link className="flex leading-3 pt-1.5 pl-1 flex-col left-0 text-[14px] transition-opacity duration-200" to="/">
          <span>BOK³</span>
          <span>Zine</span>
        </Link>
        <div className="flex items-center gap-10">
          {menuItems.map((item) => {
            const itemLabel = t(item.key);
            const label = item.to === "/cart" && cartCount > 0 ? `${itemLabel} ${cartCount}` : itemLabel;

            return item.href ? (
              <a
                key={item.key}
                className="text-[20px] transition-opacity duration-200"
                href={item.href}
                target="_blank"
                rel="noreferrer"
                style={{ opacity: 0.4 }}
              >
                {label}
              </a>
            ) : (
              <Link
                key={item.key}
                className={cx(
                  "text-[20px] transition-opacity duration-200",
                  location.pathname === item.to ? "opacity-100" : "opacity-40 hover:opacity-80"
                )}
                to={item.to}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <Link
          className="flex flex-col items-center left-0 text-sm transition-opacity duration-200 hover:opacity-50"
          to="/cart"
          aria-label={t("nav.cart")}
        >
          <img src="/images/cart.png" className="w-12" />
          {/* {cartCount > 0 ? <span className="mt-2">({cartCount})</span> : null} */}
        </Link>
      </nav>
    </>
  );
}
