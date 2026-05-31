import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { StatusScreen } from "./components/ui";
import { CartProvider, useCart } from "./lib/cart-context";
import { useZines } from "./hooks/useZines";
import AppShell from "./components/AppShell";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const ZineDetailPage = lazy(() => import("./pages/ZineDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const ZineMakerPage = lazy(() => import("./pages/ZineMakerPage"));

function AppRoutes() {
  const { zines, status, error } = useZines();
  const { items } = useCart();
  const cartCount = items.length;

  if (status === "loading") {
    return <StatusScreen>Loading zines...</StatusScreen>;
  }

  if (status === "error") {
    return <StatusScreen>Could not load zines: {error}</StatusScreen>;
  }

  return (
    <Suspense fallback={<StatusScreen>Loading page...</StatusScreen>}>
      <Routes>
        <Route element={<AppShell cartCount={cartCount} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dig" element={<CatalogPage zines={zines} />} />
          <Route path="/page/:id" element={<ZineDetailPage zines={zines} />} />
          <Route path="/cart" element={<CartPage zines={zines} />} />
          <Route path="/zine" element={<ZineMakerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  );
}
