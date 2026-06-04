import { useParams } from "react-router-dom";
import ProductDetailPanel from "../components/ProductDetailPanel";
import ZineViewer from "../components/ZineViewer";
import { GhostLink } from "../components/ui";
import { useCart } from "../lib/cart-context";
import { useI18n } from "../lib/i18n";
import { getProductImageBackgroundClass } from "../lib/product-display";

export default function ZineDetailPage({ zines }) {
  const { id } = useParams();
  const { addItem, hasItem } = useCart();
  const { t, getLocalized, language } = useI18n();
  const zine = zines.find((item) => item.id === id);
  const saved = zine ? hasItem(zine.id, "zine") : false;
  const title = zine ? getLocalized(zine.title) : "";
  const author = zine ? getLocalized(zine.author) || "" : "";
  const description = zine ? getLocalized(zine.description) : "";

  if (!zine) {
    return (
      <main className="min-h-screen p-4 md:p-7 pt-18 md:pt-22">
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <p>{t("detail.notFound", { id })}</p>
          <GhostLink to="/dig">
            <img src="/images/back.png" className="w-7" />
          </GhostLink>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-7 pt-18 md:pt-22">
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <GhostLink to="/dig">
          <img src="/images/back.png" className="w-7" />
        </GhostLink>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <ProductDetailPanel
          item={{ ...zine, type: "zine", title, description }}
          subtitle={author}
          language={language}
          imageBackgroundClassName={
            !zine.hasDisplayImage
              ? "bg-neutral-100"
              : getProductImageBackgroundClass({
                  type: "zine",
                  invertBg: zine.invertBg
                })
          }
          availabilityLabel={zine.available === false ? t("detail.unavailable") : t("detail.available")}
          actionLabel={saved ? t("detail.savedInCart") : t("detail.addToCart")}
          actionDisabled={saved}
          onAction={() => addItem(zine.id, "zine")}
        />

        <ZineViewer zine={{ ...zine, type: "zine" }} />
      </div>
    </main>
  );
}
