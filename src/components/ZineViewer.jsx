import { useEffect, useState } from "react";
import ZineImage from "./ZineImage";

export default function ZineViewer({ zine }) {
  const pages = zine?.pages?.length ? zine.pages : [zine.cover];
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState("forward");

  useEffect(() => {
    setPageIndex(0);
    setDirection("forward");
  }, [zine.id]);

  const pageLabel = `${pageIndex + 1} / ${pages.length}`;

  function moveTo(nextIndex) {
    if (nextIndex === pageIndex || nextIndex < 0 || nextIndex >= pages.length) {
      return;
    }

    setDirection(nextIndex > pageIndex ? "forward" : "backward");
    setPageIndex(nextIndex);
  }

  return (
    <section className="viewer-shell" aria-label={`${zine.title} viewer`}>
      <div className="viewer-head">
        <p>Preview</p>
        <span>{pageLabel}</span>
      </div>

      <div className="viewer-stage">
        <div key={`${zine.id}-${pageIndex}`} className={`viewer-page ${direction}`}>
          <ZineImage src={pages[pageIndex]} alt={`${zine.title} page ${pageIndex + 1}`} />
        </div>
      </div>

      <div className="viewer-nav">
        <button type="button" onClick={() => moveTo(pageIndex - 1)} disabled={pageIndex === 0}>
          Prev
        </button>
        <button
          type="button"
          onClick={() => moveTo(pageIndex + 1)}
          disabled={pageIndex === pages.length - 1}
        >
          Next
        </button>
      </div>
    </section>
  );
}
