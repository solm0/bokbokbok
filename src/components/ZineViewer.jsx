import { useEffect, useState } from "react";
import ZineImage from "./ZineImage";
import { cx, GhostButton, Panel } from "./ui";
import { useI18n } from "../lib/i18n";
import { getProductImageBackgroundClass } from "../lib/product-display";

export default function ZineViewer({ zine }) {
  const pages = zine?.pages?.length ? zine.pages : [zine.cover];
  const [pageIndex, setPageIndex] = useState(0);
  const { t, getLocalized } = useI18n();
  const title = getLocalized(zine.title);

  useEffect(() => {
    setPageIndex(0);
  }, [zine.id]);

  const pageLabel = `${pageIndex + 1} / ${pages.length}`;
  const previewBackgroundClassName = getProductImageBackgroundClass(zine);

  function moveTo(nextIndex) {
    if (nextIndex === pageIndex || nextIndex < 0 || nextIndex >= pages.length) {
      return;
    }

    setPageIndex(nextIndex);
  }

  return (
    <Panel
      className="mt-20 lg:mt-0 min-h-[calc(100vh-5rem)] md:min-h-0 lg:flex lg:min-h-[calc(100vh-11rem)] lg:flex-col"
      as="section"
      aria-label={t("viewer.viewerLabel", { title })}
    >
      <div
        className={`grid min-h-[360px] place-items-center overflow-hidden md:min-h-[540px] lg:min-h-0 lg:flex-1 ${previewBackgroundClassName}`}
      >
        <div className="aspect-[3/4] w-full max-w-[380px]">
          <ZineImage
            className={cx(
              "h-full w-full object-contain",
              zine.type === "good" && "goods-image-shadow"
            )}
            src={pages[pageIndex]}
            alt={t("viewer.pageAlt", { title, page: pageIndex + 1 })}
          />
        </div>
      </div>

      <div className="mt-1 flex justify-between text-base lg:pt-1">
        <span>{pageLabel}</span>
        <div className="flex gap-4">
          <GhostButton className="text-lg!" onClick={() => moveTo(pageIndex - 1)} disabled={pageIndex === 0}>
            {`<`}
          </GhostButton>
          <GhostButton
            className="text-lg!"
            onClick={() => moveTo(pageIndex + 1)}
            disabled={pageIndex === pages.length - 1}
          >
            {`>`}
          </GhostButton>
        </div>
      </div>
    </Panel>
  );
}
