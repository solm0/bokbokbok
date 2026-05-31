import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FabMenu from "./FabMenu";

export default function AppShell({ cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <Outlet />
      <FabMenu
        open={menuOpen}
        onToggle={() => setMenuOpen((current) => !current)}
        onClose={() => setMenuOpen(false)}
        cartCount={cartCount}
      />
    </>
  );
}
