import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCardContent from "../components/ProductCardContent";
import { cx } from "../components/ui";
import { useI18n } from "../lib/i18n";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 300;
const GRID_GAP = 10;
const GRID_TOP = 0;
const GRID_SIDE = 50;
const MOBILE_BREAKPOINT = 768;
const MOBILE_PAGE_PADDING = 16;
const MAX_GRID_COLUMNS = 5;
const RESIZE_SETTLE_MS = 180;

function getGridLayout(items, width) {
  const isMobile = width < MOBILE_BREAKPOINT;
  const columns = isMobile
    ? 2
    : Math.min(
        MAX_GRID_COLUMNS,
        Math.max(2, Math.floor((width - GRID_SIDE * 2 + GRID_GAP) / (CARD_WIDTH + GRID_GAP)))
      );
  const cardWidth = isMobile
    ? Math.floor((width - MOBILE_PAGE_PADDING * 2 - GRID_GAP) / columns)
    : CARD_WIDTH;
  const leftOffset = isMobile
    ? 0
    : Math.max(
        GRID_SIDE,
        Math.floor((width - columns * cardWidth - (columns - 1) * GRID_GAP) / 2)
      );
  const rowHeight = Math.ceil(cardWidth * (CARD_HEIGHT / CARD_WIDTH)) + 44;

  const positions = items.map((_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      x: leftOffset + column * (cardWidth + GRID_GAP),
      y: GRID_TOP + row * rowHeight
    };
  });

  const rows = Math.ceil(items.length / columns);
  const totalHeight = GRID_TOP + rows * rowHeight + 60;

  return { positions, totalHeight, sidePadding: isMobile ? 0 : leftOffset, cardWidth };
}

export default function GoodsPage({ goods }) {
  const { t, getLocalized } = useI18n();
  const [query, setQuery] = useState("");
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth
  );
  const searchInputRef = useRef(null);
  const deferredQuery = useDeferredValue(query);
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

  const availableGoods = useMemo(() => goods.filter((item) => item.available !== false), [goods]);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredGoods = useMemo(() => {
    if (!normalizedQuery) {
      return availableGoods;
    }

    return availableGoods.filter((item) =>
      String(getLocalized(item.title)).toLowerCase().includes(normalizedQuery)
    );
  }, [availableGoods, getLocalized, normalizedQuery]);
  const gridLayout = useMemo(
    () => getGridLayout(filteredGoods, viewportWidth),
    [filteredGoods, viewportWidth]
  );

  const handleClearQuery = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <main className="app-page-shell relative flex flex-col overflow-hidden p-4 md:p-7">
      <header
        className="sticky z-[100] flex w-full items-center justify-between gap-3"
        style={{
          top: isMobile ? "var(--app-mobile-search-top)" : "3.5rem",
          paddingInlineStart: `${gridLayout.sidePadding}px`,
          paddingInlineEnd: isMobile ? 0 : GRID_SIDE
        }}
      >
        <div className="flex grow md:grow-0">
          <div className="relative flex w-full items-center text-sm md:w-auto">
            <label htmlFor="goods-search" className="sr-only">
              {t("goods.searchGoods")}
            </label>
            <input
              id="goods-search"
              ref={searchInputRef}
              className="min-h-[38px] w-full py-0 pr-9 outline-none placeholder:text-neutral-500 opacity-80 focus:opacity-100 md:w-[min(320px,46vw)] font-bok font-light"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("goods.searchPlaceholder")}
              aria-label={t("goods.searchGoods")}
              spellCheck={false}
            />
            {query ? (
              <button
                type="button"
                className="absolute top-1/2 right-2.5 z-10 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 text-neutral-700"
                aria-label={t("goods.clearSearch")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClearQuery}
              >
                X
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <section
        className="relative z-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-24 md:pt-18 md:pb-24"
        style={{
          paddingTop: isMobile ? "var(--app-mobile-stage-top)" : undefined
        }}
        aria-label={t("goods.stageLabel")}
      >
        <div className="relative min-h-full" style={{ height: `${gridLayout.totalHeight}px` }}>
          {filteredGoods.map((item, index) => {
            const grid = gridLayout.positions[index];

            return (
              <Link
                key={item.id}
                className={cx(
                  "group absolute top-0 left-0 grid gap-0.5 text-left text-neutral-950 select-none",
                  "transition-[transform,opacity] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
                )}
                style={{
                  width: `${gridLayout.cardWidth}px`,
                  transform: `translate3d(${grid.x}px, ${grid.y}px, 0)`
                }}
                to={`/goods/${item.id}`}
              >
                <ProductCardContent
                  title={getLocalized(item.title)}
                  subtitle={
                    getLocalized(item.author) || getLocalized(item.brand) || t("common.unknownMaker")
                  }
                  cover={item.cover}
                  mode="grid"
                  imageBackgroundClassName="bg-neutral-100"
                />
              </Link>
            );
          })}
          {filteredGoods.length === 0 ? (
            <p className="absolute w-full flex justify-center top-10 left-3 text-xl md:top-[52px] md:left-8">
              {t("goods.empty")}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
