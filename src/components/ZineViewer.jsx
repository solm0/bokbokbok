import { useEffect, useState } from "react";
import ZineImage from "./ZineImage";
import { Eyebrow, GhostButton, Panel } from "./ui";
import { useI18n } from "../lib/i18n";

export default function ZineViewer({ zine }) {
  const pages = zine?.pages?.length ? zine.pages : [zine.cover];
  const [pageIndex, setPageIndex] = useState(0);
  const { t, getLocalized } = useI18n();
  const title = getLocalized(zine.title);

  useEffect(() => {
    setPageIndex(0);
  }, [zine.id]);

  const pageLabel = `${pageIndex + 1} / ${pages.length}`;

  function moveTo(nextIndex) {
    if (nextIndex === pageIndex || nextIndex < 0 || nextIndex >= pages.length) {
      return;
    }

    setPageIndex(nextIndex);
  }

  return (
    <Panel className="p-6" as="section" aria-label={t("viewer.viewerLabel", { title })}>
      <div className="mb-3.5 flex items-center justify-between gap-3 text-sm">
        <span>{pageLabel}</span>
      </div>

      <div className="grid bg-neutral-100 min-h-[360px] place-items-center overflow-hidden  md:min-h-[540px]">
        <div className="aspect-[3/4] w-full max-w-[380px]">
          <ZineImage
            className="h-full w-full object-contain"
            src={pages[pageIndex]}
            alt={t("viewer.pageAlt", { title, page: pageIndex + 1 })}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <GhostButton className="min-w-21" onClick={() => moveTo(pageIndex - 1)} disabled={pageIndex === 0}>
          {t("viewer.prev")}
        </GhostButton>
        <GhostButton
          className="min-w-21"
          onClick={() => moveTo(pageIndex + 1)}
          disabled={pageIndex === pages.length - 1}
        >
          {t("viewer.next")}
        </GhostButton>
      </div>
    </Panel>
  );
}
