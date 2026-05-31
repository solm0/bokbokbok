import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FabMenu from "./FabMenu";

export default function AppShell({ cartCount }) {
  const [navVisible, setNavVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setNavVisible(location.pathname !== "/");
  }, [location.pathname]);

  return (
    <>
      <Outlet context={{ revealNav: () => setNavVisible(true) }} />
      <FabMenu visible={navVisible} cartCount={cartCount} />
    </>
  );
}
