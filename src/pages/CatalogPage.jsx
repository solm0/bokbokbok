import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Shuffle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCardContent from "../components/ProductCardContent";
import { GhostButton, cx } from "../components/ui";
import { useI18n } from "../lib/i18n";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 300;
const MOBILE_BREAKPOINT = 768;
const MOBILE_SCATTER_SAMPLE_SIZE = 8;
const SCATTER_SAMPLE_SIZE = 15;
const GRID_GAP = 10;
const MAX_GRID_COLUMNS = 5;
const SCATTER_TOP = 32;
const SCATTER_BOTTOM = 3;
const SCATTER_SIDE = 50;
const RESIZE_SETTLE_MS = 180;
const DRAG_MOVE_THRESHOLD = 6;
const MAX_SCATTER_ROTATION = 20;

function hashSeed(value) {
  return String(value).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getRandomSample(items, size) {
  if (items.length <= size) {
    return items;
  }

  const pool = [...items];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
  }

  return pool.slice(0, size);
}

function getOverlapArea(a, b) {
  const overlapWidth = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const overlapHeight = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

  return overlapWidth * overlapHeight;
}

function getScatterLayout(zines, width, height) {
  const usableWidth = Math.max(width - SCATTER_SIDE * 2 - CARD_WIDTH, CARD_WIDTH);
  const usableHeight = Math.max(
    height - SCATTER_TOP - SCATTER_BOTTOM - CARD_HEIGHT,
    CARD_HEIGHT
  );
  const placedCards = [];

  return zines.map((zine, index) => {
    const seed = hashSeed(zine.id) + index * 17;
    let bestCandidate = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let attempt = 0; attempt < 36; attempt += 1) {
      const attemptSeed = seed + attempt * 97;
      const left = SCATTER_SIDE + ((attemptSeed * 73) % usableWidth);
      const top = SCATTER_TOP + ((attemptSeed * 41) % usableHeight);
      const cardBox = {
        left,
        top,
        right: left + CARD_WIDTH,
        bottom: top + CARD_HEIGHT
      };
      const overlapScore = placedCards.reduce((sum, placedCard) => {
        const overlapArea = getOverlapArea(cardBox, placedCard);
        return sum + overlapArea;
      }, 0);

      const centerPullX = Math.abs(left - (SCATTER_SIDE + usableWidth / 2)) * 0.04;
      const centerPullY = Math.abs(top - (SCATTER_TOP + usableHeight / 2)) * 0.03;
      const score = overlapScore + centerPullX + centerPullY;

      if (score < bestScore) {
        bestScore = score;
        bestCandidate = cardBox;
      }

      if (overlapScore === 0) {
        break;
      }
    }

    const rotation = ((seed * 31) % (MAX_SCATTER_ROTATION * 2 + 1)) - MAX_SCATTER_ROTATION;
    placedCards.push(bestCandidate);

    return {
      x: bestCandidate.left,
      y: bestCandidate.top,
      rotation
    };
  });
}

function getGridLayout(zines, width) {
  const columns = Math.min(
    MAX_GRID_COLUMNS,
    Math.max(2, Math.floor((width - SCATTER_SIDE * 2 + GRID_GAP) / (CARD_WIDTH + GRID_GAP)))
  );
  const leftOffset = Math.max(
    SCATTER_SIDE,
    Math.floor((width - columns * CARD_WIDTH - (columns - 1) * GRID_GAP) / 2)
  );

  const positions = zines.map((_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      x: leftOffset + column * (CARD_WIDTH + GRID_GAP),
      y: SCATTER_TOP + row * (CARD_HEIGHT + 44),
      rotation: 0
    };
  });

  const rows = Math.ceil(zines.length / columns);
  const totalHeight = SCATTER_TOP + rows * (CARD_HEIGHT + 44) + 60;

  return { positions, totalHeight, sidePadding: leftOffset };
}

export default function CatalogPage({ zines }) {
  const { t, getLocalized } = useI18n();
  const [viewMode, setViewMode] = useState("scatter");
  const [query, setQuery] = useState("");
  const [scatterZines, setScatterZines] = useState([]);
  const [draggingId, setDraggingId] = useState("");
  const [scatterOverrides, setScatterOverrides] = useState({});
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 900 : window.innerHeight
  }));
  const navigate = useNavigate();
  const deferredQuery = useDeferredValue(query);
  const dragRef = useRef(null);
  const searchInputRef = useRef(null);
  const suppressClickRef = useRef("");
  const scatterSampleSize = viewport.width < MOBILE_BREAKPOINT ? MOBILE_SCATTER_SAMPLE_SIZE : SCATTER_SAMPLE_SIZE;

  useEffect(() => {
    let timeoutId = 0;

    const onResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, RESIZE_SETTLE_MS);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const availableZines = useMemo(() => zines.filter((zine) => zine.available !== false), [zines]);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredZines = useMemo(() => {
    if (!normalizedQuery) {
      return availableZines;
    }

    return availableZines.filter((zine) =>
      String(getLocalized(zine.title)).toLowerCase().includes(normalizedQuery)
    );
  }, [availableZines, getLocalized, normalizedQuery]);

  useEffect(() => {
    setScatterZines(getRandomSample(filteredZines, scatterSampleSize));
  }, [filteredZines, scatterSampleSize]);

  useEffect(() => {
    setScatterOverrides({});
    setDraggingId("");
    dragRef.current = null;
    suppressClickRef.current = "";
  }, [scatterZines]);

  const handleShuffle = () => {
    setScatterZines(getRandomSample(filteredZines, scatterSampleSize));
  };

  const handleClearQuery = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  const displayedZines = viewMode === "grid" ? filteredZines : scatterZines;
  const scatterPositions = useMemo(
    () => getScatterLayout(scatterZines, viewport.width, viewport.height),
    [scatterZines, viewport.height, viewport.width]
  );
  const gridLayout = useMemo(
    () => getGridLayout(filteredZines, viewport.width),
    [filteredZines, viewport.width]
  );
  const headerPaddingX = gridLayout.sidePadding;
  const scatterPositionMap = useMemo(
    () =>
      scatterZines.reduce((positions, zine, index) => {
        positions[zine.id] = scatterPositions[index];
        return positions;
      }, {}),
    [scatterPositions, scatterZines]
  );
  const stageHeight = viewMode === "grid" ? gridLayout.totalHeight : viewport.height;
  const maxScatterX = Math.max(SCATTER_SIDE, viewport.width - SCATTER_SIDE - CARD_WIDTH);
  const maxScatterY = Math.max(SCATTER_TOP, viewport.height - SCATTER_BOTTOM - CARD_HEIGHT);

  const handleScatterPointerDown = (event, zineId) => {
    if (viewMode !== "scatter") {
      return;
    }

    const startPosition = scatterOverrides[zineId] ?? scatterPositionMap[zineId];
    if (!startPosition) {
      return;
    }

    event.preventDefault();

    dragRef.current = {
      id: zineId,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: startPosition.x,
      startY: startPosition.y,
      moved: false
    };
    setDraggingId(zineId);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  useEffect(() => {
    function handlePointerMove(event) {
      const dragState = dragRef.current;
      if (!dragState) {
        return;
      }

      const deltaX = event.clientX - dragState.startClientX;
      const deltaY = event.clientY - dragState.startClientY;
      const nextX = Math.max(SCATTER_SIDE, Math.min(maxScatterX, dragState.startX + deltaX));
      const nextY = Math.max(SCATTER_TOP, Math.min(maxScatterY, dragState.startY + deltaY));
      const movedEnough =
        Math.abs(deltaX) > DRAG_MOVE_THRESHOLD || Math.abs(deltaY) > DRAG_MOVE_THRESHOLD;

      if (movedEnough && !dragState.moved) {
        dragState.moved = true;
      }

      setScatterOverrides((current) => ({
        ...current,
        [dragState.id]: {
          ...(scatterPositionMap[dragState.id] ?? current[dragState.id] ?? {}),
          x: nextX,
          y: nextY
        }
      }));
    }

    function handlePointerUp() {
      const dragState = dragRef.current;
      if (!dragState) {
        return;
      }

      if (dragState.moved) {
        suppressClickRef.current = dragState.id;
      }

      dragRef.current = null;
      setDraggingId("");
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [maxScatterX, maxScatterY, scatterPositionMap]);

  return (
    <main
      className={cx(
        "relative min-h-screen w-full",
        viewMode === "grid" ? "grid-mode" : "scatter-mode"
      )}
    >
      <header
        className="items-start sticky top-14 z-[100] flex w-full items-center justify-between gap-3"
        style={{ paddingInlineStart: `${headerPaddingX}px`, paddingInlineEnd: SCATTER_SIDE }}
      >
        <div className="flex w-full flex-wrap items-start justify-start gap-3 md:w-auto md:justify-end">
          <div className="flex flex-col items-start gap-1" role="tablist" aria-label={t("catalog.displayMode")}>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                className={cx(
                  "text-sm transition-opacity",
                  viewMode === "scatter" ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                )}
                onClick={() => setViewMode("scatter")}
              >
                {t("catalog.scatter")}
              </button>
              {viewMode === "scatter" ? (
                <GhostButton
                  className="pointer-events-auto"
                  onClick={handleShuffle}
                  aria-label={t("catalog.shuffle")}
                >
                  <Shuffle size={16} strokeWidth={2.2} aria-hidden="true" />
                </GhostButton>
              ) : null}
            </div>
            <button
              type="button"
              className={cx(
                "text-sm transition-opacity",
                viewMode === "grid" ? 'opacity-100' : 'opacity-40 hover:opacity-80'
              )}
              onClick={() => setViewMode("grid")}
            >
              {t("catalog.grid")}
            </button>
          </div>
        </div>
        <div className="flex">
          <div className="relative flex w-full text-sm items-center md:w-auto">
            <label htmlFor="catalog-search" className="sr-only">
              {t("catalog.searchZines")}
            </label>
            <input
              id="catalog-search"
              ref={searchInputRef}
              className="min-h-[38px] w-full py-0 pr-9 outline-none placeholder:text-neutral-500 opacity-80 focus:opacity-100 md:w-[min(320px,46vw)]"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("common.search")}
              aria-label={t("catalog.searchTitles")}
            />
            {query ? (
              <button
                type="button"
                className="absolute top-1/2 right-2.5 z-10 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 text-neutral-700"
                aria-label={t("catalog.clearSearch")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClearQuery}
              >
                <X size={14} strokeWidth={2.2} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
        
      </header>

      <section
        className={cx(
          "relative z-0 overflow-x-hidden pt-8",
          viewMode === "grid"
            ? "min-h-[calc(100vh-90px)] overflow-y-auto pb-24 md:pb-24"
            : "h-[calc(100vh-90px)] overflow-hidden pb-0"
        )}
        aria-label={t("catalog.stageLabel")}
      >
        <div className="relative min-h-full" style={{ height: `${stageHeight}px` }}>
          {displayedZines.map((zine, index) => {
            const scatter = scatterOverrides[zine.id] ?? scatterPositionMap[zine.id];
            const grid = gridLayout.positions[index];
            const active = viewMode === "grid" ? grid : scatter;
            return (
              <button
                key={zine.id}
                type="button"
                className={cx(
                  "group absolute top-0 left-0 grid gap-0.5 text-left text-neutral-950 select-none [touch-action:none]",
                  "transition-[transform,opacity] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  viewMode === "scatter" ? "cursor-grab" : "cursor-pointer",
                  draggingId === zine.id && viewMode === "scatter" && "cursor-grabbing transition-none"
                )}
                draggable="false"
                style={{
                  width: `${CARD_WIDTH}px`,
                  transform: `translate3d(${active.x}px, ${active.y}px, 0) rotate(${active.rotation}deg)`,
                  zIndex: viewMode === "grid" ? 2 : draggingId === zine.id ? 250 : displayedZines.length - index
                }}
                onDragStart={(event) => event.preventDefault()}
                onPointerDown={(event) => handleScatterPointerDown(event, zine.id)}
                onClick={() => {
                  if (suppressClickRef.current === zine.id) {
                    suppressClickRef.current = "";
                    return;
                  }

                  navigate(`/page/${zine.id}`);
                }}
              >
                <ProductCardContent
                  title={getLocalized(zine.title)}
                  subtitle={getLocalized(zine.author) || t("common.unknownAuthor")}
                  cover={zine.cover}
                  mode={viewMode}
                  imageBackgroundClassName="bg-black"
                />
              </button>
            );
          })}
          {displayedZines.length === 0 ? (
            <p className="absolute top-10 left-3 text-sm md:top-[52px] md:left-8">
              {t("catalog.empty")}
            </p>
          ) : null}
        </div>
        
      </section>
    </main>
  );
}
