import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { getProductImageBackgroundClass } from "../lib/product-display";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 300;
const GRID_GAP = 8;
const GRID_TOP = 0;
const GRID_SIDE = 50;
const MOBILE_BREAKPOINT = 768;
const MOBILE_PAGE_PADDING = 16;
const MAX_GRID_COLUMNS = 5;
const RESIZE_SETTLE_MS = 180;

function getGridLayout(width) {
  const isMobile = width < MOBILE_BREAKPOINT;

  const columns = isMobile
    ? 2
    : Math.min(
        MAX_GRID_COLUMNS,
        Math.max(
          2,
          Math.floor((width - GRID_SIDE * 2 + GRID_GAP) / (CARD_WIDTH + GRID_GAP))
        )
      );

  const cardWidth = isMobile
    ? Math.floor((width - MOBILE_PAGE_PADDING * 2 - GRID_GAP) / columns)
    : CARD_WIDTH;

  const leftOffset = isMobile
    ? 0
    : Math.max(
        GRID_SIDE,
        Math.floor(
          (width - columns * cardWidth - (columns - 1) * GRID_GAP) / 2
        )
      );

  return {
    sidePadding: isMobile ? 0 : leftOffset,
    cardWidth
  };
}

export default function FontPage() {
  const { t } = useI18n();

  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth
  );

  const isMobile = viewportWidth < MOBILE_BREAKPOINT;

  useEffect(() => {
    let timeoutId = 0;

    const onResize = () => {
      window.clearTimeout(timeoutId);

      timeoutId = window.setTimeout(() => {
        setViewportWidth(window.innerWidth);
      }, RESIZE_SETTLE_MS);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const gridLayout = useMemo(
    () => getGridLayout(viewportWidth),
    [viewportWidth]
  );

  return (
    <main className="app-page-shell relative flex flex-col overflow-hidden p-4 md:p-7 pb-0 md:pb-0">
      <header
        className="floating-controls-header sticky z-[100] flex w-full items-center"
        style={{
          top: "3rem",
          paddingInlineStart: `${gridLayout.sidePadding}px`,
          paddingInlineEnd: isMobile ? 0 : GRID_SIDE
        }}
      >
        <div className="font-bok font-light text-sm opacity-80 text-neutral-500">
          {t("nav.font")}
        </div>
      </header>

      <section
        className="relative z-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-24 md:pt-20 md:pb-24"
        style={{
          paddingTop: isMobile ? "var(--app-mobile-stage-top)" : undefined
        }}
      >
        <div
          className="relative min-h-full"
          style={{
            height: `${CARD_HEIGHT + 100}px`
          }}
        >
          <Link
            to="/font/preview"
            className="group absolute top-0 left-0 text-left"
            style={{
              width: `${gridLayout.cardWidth}px`,
              transform: `translate3d(${gridLayout.sidePadding}px, 0, 0)`
            }}
          >
            <span
              className={`block aspect-3/4 overflow-hidden p-3 transition duration-200 group-hover:opacity-80 ${getProductImageBackgroundClass({
                type: "good"
              })}`}
            >
              <span className="font-lazy-preview goods-image-shadow flex h-full w-full items-center justify-center break-words text-xl md:text-2xl">
                {t("font.cardTitle") || t("font.download")}
              </span>
            </span>
            <span className="mt-3 text-xs font-bold text-neutral-950">
              Lazy Font
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
