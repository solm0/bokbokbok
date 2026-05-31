import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FabMenu from "./FabMenu";

export default function AppShell({ cartCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const desktopNavVisible = !isHome || desktopMenuOpen;

  useEffect(() => {
    setMobileMenuOpen(false);
    if (!isHome) {
      setDesktopMenuOpen(false);
    }
  }, [isHome, location.pathname]);

  return (
    <>
      <Outlet
        context={{
          revealNav: () => setMobileMenuOpen(true),
          toggleNav: () => {
            if (isHome) {
              setDesktopMenuOpen((current) => !current);
              return;
            }

            setMobileMenuOpen((current) => !current);
          },
          hideNav: () => {
            setMobileMenuOpen(false);
            setDesktopMenuOpen(false);
          },
          navVisible: desktopNavVisible,
          mobileMenuOpen,
        }}
      />
      <FabMenu
        desktopVisible={desktopNavVisible}
        mobileOpen={mobileMenuOpen}
        cartCount={cartCount}
        onToggle={() => setMobileMenuOpen((current) => !current)}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
