import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCardContent from "../components/ProductCardContent";
import { cx } from "../components/ui";
import { useI18n } from "../lib/i18n";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 300;
const GRID_GAP = 10;
const GRID_TOP = 32;
const GRID_SIDE = 50;
const MAX_GRID_COLUMNS = 5;
const RESIZE_SETTLE_MS = 180;

function getGridLayout(items, width) {
  const columns = Math.min(
    MAX_GRID_COLUMNS,
    Math.max(2, Math.floor((width - GRID_SIDE * 2 + GRID_GAP) / (CARD_WIDTH + GRID_GAP)))
  );
  const leftOffset = Math.max(
    GRID_SIDE,
    Math.floor((width - columns * CARD_WIDTH - (columns - 1) * GRID_GAP) / 2)
  );

  const positions = items.map((_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      x: leftOffset + column * (CARD_WIDTH + GRID_GAP),
      y: GRID_TOP + row * (CARD_HEIGHT + 44)
    };
  });

  const rows = Math.ceil(items.length / columns);
  const totalHeight = GRID_TOP + rows * (CARD_HEIGHT + 44) + 60;

  return { positions, totalHeight, sidePadding: leftOffset };
}

export default function GoodsPage({ goods }) {
  const { t, getLocalized } = useI18n();
  const [query, setQuery] = useState("");
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth
  );
  const searchInputRef = useRef(null);
  const deferredQuery = useDeferredValue(query);

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
    <main className="relative min-h-screen w-full bg-white">
      <header
        className="sticky top-14 z-[100] flex w-full items-start justify-end gap-3"
        style={{ paddingInlineStart: `${gridLayout.sidePadding}px`, paddingInlineEnd: GRID_SIDE }}
      >
        <div className="relative flex w-full items-center text-sm md:w-auto">
          <label htmlFor="goods-search" className="sr-only">
            {t("goods.searchGoods")}
          </label>
          <input
            id="goods-search"
            ref={searchInputRef}
            className="min-h-[38px] w-full py-0 pr-9 outline-none placeholder:text-neutral-500 opacity-80 focus:opacity-100 md:w-[min(320px,46vw)]"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("goods.searchPlaceholder")}
            aria-label={t("goods.searchGoods")}
          />
          {query ? (
            <button
              type="button"
              className="absolute top-1/2 right-2.5 z-10 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 text-neutral-700"
              aria-label={t("goods.clearSearch")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClearQuery}
            >
              <X size={14} strokeWidth={2.2} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>

      <section
        className="relative z-0 min-h-[calc(100vh-90px)] overflow-x-hidden overflow-y-auto pt-8 pb-24 md:pb-24"
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
                  width: `${CARD_WIDTH}px`,
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
                  imageBackgroundClassName="bg-white"
                />
              </Link>
            );
          })}
          {filteredGoods.length === 0 ? (
            <p className="absolute top-10 left-3 text-sm md:top-[52px] md:left-8">
              {t("goods.empty")}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
