import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { StatusScreen } from "./components/ui";
import { CartProvider, useCart } from "./lib/cart-context";
import { useGoods } from "./hooks/useGoods";
import { useZines } from "./hooks/useZines";
import { I18nProvider, useI18n } from "./lib/i18n";
import AppShell from "./components/AppShell";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const GoodsPage = lazy(() => import("./pages/GoodsPage"));
const GoodsDetailPage = lazy(() => import("./pages/GoodsDetailPage"));
const ZineDetailPage = lazy(() => import("./pages/ZineDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const ZineMakerPage = lazy(() => import("./pages/ZineMakerPage"));
const FontPage = lazy(() => import("./pages/FontPage"));
const FontDetailPage = lazy(() => import("./pages/FontDetailPage"));

function AppRoutes() {
  const { zines, status, error } = useZines();
  const { goods, status: goodsStatus, error: goodsError } = useGoods();
  const { items } = useCart();
  const { t } = useI18n();
  const cartCount = items.length;

  if (status === "loading" || goodsStatus === "loading") {
    return <StatusScreen>{t("status.loadingPage")}</StatusScreen>;
  }

  if (status === "error") {
    return <StatusScreen>{t("status.loadZinesError", { error })}</StatusScreen>;
  }

  if (goodsStatus === "error") {
    return <StatusScreen>{t("status.loadGoodsError", { error: goodsError })}</StatusScreen>;
  }

  return (
    <Suspense fallback={<StatusScreen>{t("status.loadingPage")}</StatusScreen>}>
      <Routes>
        <Route element={<AppShell cartCount={cartCount} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/goods" element={<GoodsPage goods={goods} />} />
          <Route path="/goods/:id" element={<GoodsDetailPage goods={goods} />} />
          <Route path="/font" element={<FontPage />} />
          <Route path="/font/preview" element={<FontDetailPage />} />
          <Route path="/dig" element={<CatalogPage zines={zines} />} />
          <Route path="/page/:id" element={<ZineDetailPage zines={zines} />} />
          <Route path="/cart" element={<CartPage zines={zines} goods={goods} />} />
          <Route path="/zine" element={<ZineMakerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </I18nProvider>
  );
}
