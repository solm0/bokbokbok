import { useParams } from "react-router-dom";
import ProductDetailPanel from "../components/ProductDetailPanel";
import ZineViewer from "../components/ZineViewer";
import { GhostLink } from "../components/ui";
import { useCart } from "../lib/cart-context";
import { useI18n } from "../lib/i18n";

const detailGridClassName = "grid items-start gap-4 lg:gap-7 lg:grid-cols-[minmax(280px,2fr)_minmax(360px,3fr)]";

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
        <div className={detailGridClassName}>
          <p>{t("goodsDetail.notFound", { id })}</p>
          <GhostLink to="/goods">
            <img src="/images/back.png" className="w-7" />
          </GhostLink>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 md:p-7 pt-18 md:pt-22">
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <GhostLink to="/goods">
          <img src="/images/back.png" className="w-7" />
        </GhostLink>
      </div>

      <div className={detailGridClassName}>
        <ProductDetailPanel
          item={{ ...good, type: "good", title, description }}
          subtitle={maker}
          language={language}
          availabilityLabel={good.available === false ? t("detail.unavailable") : t("detail.available")}
          actionLabel={saved ? t("detail.savedInCart") : t("detail.addToCart")}
          actionDisabled={saved}
          onAction={() => addItem(good.id, "good")}
        />

        <ZineViewer zine={{ ...good, type: "good", title }} />
      </div>
    </main>
  );
}
