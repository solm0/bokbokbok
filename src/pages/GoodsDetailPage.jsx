import { useParams } from "react-router-dom";
import ProductDetailPanel from "../components/ProductDetailPanel";
import ZineViewer from "../components/ZineViewer";
import { GhostLink } from "../components/ui";
import { useCart } from "../lib/cart-context";
import { useI18n } from "../lib/i18n";

export default function GoodsDetailPage({ goods }) {
  const { id } = useParams();
  const { addItem, hasItem } = useCart();
  const { t, getLocalized, language } = useI18n();
  const good = goods.find((item) => item.id === id);
  const saved = good ? hasItem(good.id, "good") : false;
  const title = good ? getLocalized(good.title) : "";
  const maker = good
    ? getLocalized(good.brand) || ""
    : "";
  const description = good ? getLocalized(good.description) : "";

  if (!good) {
    return (
      <main className="min-h-screen p-4 md:p-7 pt-18 md:pt-22">
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <p>{t("goodsDetail.notFound", { id })}</p>
          <GhostLink to="/goods">
            {t("goodsDetail.backToGoods")}
          </GhostLink>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 md:p-7 pt-18 md:pt-22">
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <GhostLink to="/goods">
          {t("goodsDetail.backToGoods")}
        </GhostLink>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <ProductDetailPanel
          item={{ ...good, type: "good", title, description }}
          subtitle={maker}
          language={language}
          availabilityLabel={good.available === false ? t("detail.unavailable") : t("detail.available")}
          actionLabel={saved ? t("detail.savedInCart") : t("detail.addToCart")}
          actionDisabled={saved}
          onAction={() => addItem(good.id, "good")}
          smallImage
        />

        <ZineViewer zine={{ ...good, type: "good", title }} />
      </div>
    </main>
  );
}
