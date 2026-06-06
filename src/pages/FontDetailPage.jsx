import { useMemo, useState } from "react";
import { useI18n } from "../lib/i18n";
import { getProductImageBackgroundClass } from "../lib/product-display";

const FONT_PATH = "/fonts/lazy.otf";

export default function FontDetailPage() {
  const { t } = useI18n();
  const [previewText, setPreviewText] = useState("");
  const previewSample = previewText || t("font.previewPlaceholder");
  const previewLetters = useMemo(
    () => previewSample.slice(0, 8).split(""),
    [previewSample]
  );

  return (
    <main className="app-page-shell relative flex flex-col overflow-hidden px-4 pt-24 pb-8 md:px-7 md:pt-28">
      <section className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-9 overflow-y-auto pb-20">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-2">
            <h1 className="font-lazy-preview text-4xl leading-none md:text-6xl">Lazy</h1>
            <p className="max-w-[38ch] text-lg leading-[1.45] opacity-70 md:text-xl">
              {t("font.description")}
            </p>
          </div>
          <a
            className="inline-flex w-fit items-center justify-center bg-neutral-950 px-4 py-3 text-base leading-none text-white transition hover:-translate-y-0.5 hover:opacity-85"
            href={FONT_PATH}
            download="lazy.otf"
          >
            {t("font.download")}
          </a>
        </header>

        <div className="mt-6 w-full pl-4 md:pl-[50px]">
          <label className="sr-only" htmlFor="font-preview">
            {t("font.previewLabel")}
          </label>
          <input
            id="font-preview"
            className="w-full border-0 border-b border-dotted border-neutral-950 bg-transparent px-0 py-2 text-xl outline-none placeholder:text-neutral-500"
            value={previewText}
            onChange={(event) => setPreviewText(event.target.value)}
            placeholder={t("font.previewPlaceholder")}
            spellCheck={false}
          />

          <div style={{ width: "min(200px, 100%)" }} className="mt-6">
            <span className={`block aspect-3/4 overflow-hidden p-3 ${getProductImageBackgroundClass("good")}`}>
              <div className="font-lazy-preview h-full w-full flex items-center justify-center text-xl md:text-2xl break-words goods-image-shadow">
                {previewText || t("font.previewPlaceholder")}
              </div>
            </span>
            <span className="mt-3 text-xs font-bold">{t("font.cardTitle") || t("font.download")}</span>
            <span className="text-xs opacity-70 mt-2 block">{t("font.cardSubtitle") || t("font.previewPlaceholder")}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-x-4 gap-y-5 border-t border-dotted border-neutral-950 pt-6 font-lazy-preview text-xl leading-none md:grid-cols-8 md:text-2xl">
          {previewLetters.map((letter, index) => (
            <span key={`${letter}-${index}`}>{letter}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
