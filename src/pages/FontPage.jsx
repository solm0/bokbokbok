import { Link } from "react-router-dom";
import ProductCardContent from "../components/ProductCardContent";
import { getProductImageBackgroundClass } from "../lib/product-display";
import { useI18n } from "../lib/i18n";

export default function FontPage() {
  const { t } = useI18n();

  return (
    <main className="app-page-shell relative flex flex-col overflow-hidden px-4 pt-24 pb-8 md:px-7 md:pt-28">
      <section className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-9 overflow-y-auto pb-20">
       <header>
 <h1 className="font-bok text-sm font-light">
  {t("nav.font")}
</h1>
</header>

        <div className="mt-6 w-full pl-4 md:pl-[50px]">
          <Link
            to="/font/preview"
            className="group block rounded-sm border border-neutral-200 p-0 text-left hover:opacity-90"
            style={{ width: "min(200px, 100%)" }}
          >
            <ProductCardContent
              title={t("font.cardTitle") || t("font.download")}
              subtitle={t("font.cardSubtitle") || t("font.previewPlaceholder")}
              cover={undefined}
              mode="grid"
              imageBackgroundClassName={getProductImageBackgroundClass("good")}
              imageClassName="goods-image-shadow"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
