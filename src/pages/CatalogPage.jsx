import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Shuffle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ZineImage from "../components/ZineImage";

const CARD_WIDTH = 144;
const CARD_HEIGHT = 192;
const MOBILE_BREAKPOINT = 768;
const MOBILE_SCATTER_SAMPLE_SIZE = 8;
const SCATTER_SAMPLE_SIZE = 15;
const GRID_GAP = 20;
const SCATTER_TOP = 32;
const SCATTER_BOTTOM = 120;
const SCATTER_SIDE = 56;
const RESIZE_SETTLE_MS = 180;
const DRAG_MOVE_THRESHOLD = 6;

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

    const rotation = ((seed * 29) % 18) - 9;
    placedCards.push(bestCandidate);

    return {
      x: bestCandidate.left,
      y: bestCandidate.top,
      rotation
    };
  });
}

function getGridLayout(zines, width) {
  const columns = Math.max(2, Math.floor((width - SCATTER_SIDE * 2 + GRID_GAP) / (CARD_WIDTH + GRID_GAP)));
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

  return { positions, totalHeight };
}

export default function CatalogPage({ zines }) {
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

    return availableZines.filter((zine) => zine.title.toLowerCase().includes(normalizedQuery));
  }, [availableZines, normalizedQuery]);

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
    <main className={`dig-page ${viewMode === "grid" ? "grid-mode" : "scatter-mode"}`}>
      <header className="dig-header">
        <h1 className="dig-title">DIG</h1>
        <div className="dig-toolbar">
          <label className="dig-search">
            <span className="sr-only">Search zines</span>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onInput={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search titles"
              aria-label="Search titles"
            />
            {query ? (
              <button
                type="button"
                className="dig-search-clear"
                aria-label="Clear search"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClearQuery}
              >
                <X size={14} strokeWidth={2.2} aria-hidden="true" />
              </button>
            ) : null}
          </label>
          <div className="dig-controls" role="tablist" aria-label="Display mode">
            <button
              type="button"
              className={`mode-btn ${viewMode === "scatter" ? "selected" : ""}`}
              onClick={() => setViewMode("scatter")}
            >
              Scatter
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === "grid" ? "selected" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
          </div>
        </div>
      </header>

      <section className="dig-canvas" aria-label="Zine display">
        <div className="dig-stage" style={{ height: `${stageHeight}px` }}>
          {displayedZines.map((zine, index) => {
            const scatter = scatterOverrides[zine.id] ?? scatterPositionMap[zine.id];
            const grid = gridLayout.positions[index];
            const active = viewMode === "grid" ? grid : scatter;

            return (
              <button
                key={zine.id}
                type="button"
                className={`dig-card ${draggingId === zine.id ? "dragging" : ""}`}
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
                <span className="dig-card-cover">
                  <ZineImage src={zine.cover} alt={zine.title} />
                </span>
                <span className="dig-card-title">{zine.title}</span>
              </button>
            );
          })}
          {displayedZines.length === 0 ? (
            <p className="dig-empty">No zines match that title.</p>
          ) : null}
        </div>
        {viewMode === "scatter" ? (
          <div className="dig-shuffle-wrap">
            <button
              type="button"
              className="dig-shuffle-btn"
              onClick={handleShuffle}
              aria-label="Shuffle random zines"
            >
              <Shuffle size={16} strokeWidth={2.2} aria-hidden="true" />
              {`Shuffle ${scatterSampleSize}`}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
