import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductOptionSelector from "../components/ProductOptionSelector";
import ProductDetailPanel from "../components/ProductDetailPanel";
import ZineViewer from "../components/ZineViewer";
import { GhostLink } from "../components/ui";
import { useCart } from "../lib/cart-context";
import { useI18n } from "../lib/i18n";
import {
  getDefaultSelectedOptions,
  getOptionsEntries,
  hasAnyAvailableVariant,
  isOptionValueAvailable,
  isVariantAvailable,
  resolveSelectedOptions
} from "../lib/product-options";

const detailGridClassName = "grid items-start gap-4 lg:gap-7 lg:grid-cols-[minmax(280px,2fr)_minmax(360px,3fr)]";

export default function GoodsDetailPage({ goods }) {
  const { id } = useParams();
  const { addItem, hasItem } = useCart();
  const { t, getLocalized, language } = useI18n();
  const good = goods.find((item) => item.id === id);
  const defaultSelectedOptions = useMemo(() => getDefaultSelectedOptions(good), [good]);
  const [selectedOptions, setSelectedOptions] = useState(defaultSelectedOptions);
  const title = good ? getLocalized(good.title) : "";
  const maker = good
    ? getLocalized(good.brand) || ""
    : "";
  const description = good ? getLocalized(good.description) : "";
  const resolvedSelectedOptions = useMemo(
    () => resolveSelectedOptions(good, selectedOptions),
    [good, selectedOptions]
  );
  const optionGroups = useMemo(() => getOptionsEntries(good), [good]);
  const variantAvailable = good ? isVariantAvailable(good, resolvedSelectedOptions) : false;
  const goodAvailable = good ? hasAnyAvailableVariant(good) : false;
  const saved = good ? hasItem(good.id, "good", resolvedSelectedOptions) : false;

  useEffect(() => {
    setSelectedOptions(defaultSelectedOptions);
  }, [defaultSelectedOptions, id]);

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
          item={{ ...good, type: "good", title, description, available: variantAvailable }}
          subtitle={maker}
          optionSelector={
            optionGroups.length ? (
              <ProductOptionSelector
                namePrefix={`goods-option-${good.id}`}
                optionGroups={optionGroups}
                selectedOptions={resolvedSelectedOptions}
                onChange={(groupKey, optionValue) =>
                  setSelectedOptions((current) => ({ ...current, [groupKey]: optionValue }))
                }
                getGroupLabel={(groupKey) => t(`detail.optionGroups.${groupKey}`)}
                isOptionDisabled={(groupKey, optionValue) =>
                  !isOptionValueAvailable(good, resolvedSelectedOptions, groupKey, optionValue)
                }
              />
            ) : null
          }
          language={language}
          availabilityLabel={variantAvailable ? t("detail.available") : t("detail.unavailable")}
          actionLabel={saved ? t("detail.savedInCart") : t("detail.addToCart")}
          actionDisabled={saved || !variantAvailable || !goodAvailable}
          onAction={() => addItem(good.id, "good", resolvedSelectedOptions)}
        />

        <ZineViewer zine={{ ...good, type: "good", title }} />
      </div>
    </main>
  );
}
