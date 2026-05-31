import { useEffect, useState } from "react";
import ZineImage from "./ZineImage";
import { Eyebrow, GhostButton, Panel } from "./ui";

export default function ZineViewer({ zine }) {
  const pages = zine?.pages?.length ? zine.pages : [zine.cover];
  const [pageIndex, setPageIndex] = useState(0);

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
    <Panel className="bg-slate-300 p-6" as="section" aria-label={`${zine.title} viewer`}>
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <Eyebrow>Preview</Eyebrow>
        <span>{pageLabel}</span>
      </div>

      <div className="grid min-h-[360px] place-items-center overflow-hidden border border-neutral-950 bg-slate-400 md:min-h-[540px]">
        <div className="aspect-[3/4] w-full max-w-[380px] border border-neutral-950 bg-white shadow-[18px_24px_0_rgba(0,0,0,0.16)]">
          <ZineImage
            className="h-full w-full object-cover"
            src={pages[pageIndex]}
            alt={`${zine.title} page ${pageIndex + 1}`}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2.5">
        <GhostButton className="min-w-21" onClick={() => moveTo(pageIndex - 1)} disabled={pageIndex === 0}>
          Prev
        </GhostButton>
        <GhostButton
          className="min-w-21"
          onClick={() => moveTo(pageIndex + 1)}
          disabled={pageIndex === pages.length - 1}
        >
          Next
        </GhostButton>
      </div>
    </Panel>
  );
}
