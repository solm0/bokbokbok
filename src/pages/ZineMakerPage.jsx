import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Eyebrow, GhostButton, PrimaryButton, cx } from "../components/ui";
import { useI18n } from "../lib/i18n";

const formats = {
  a5: { w: 420, h: 594 },
  a4: { w: 500, h: 707 },
  square: { w: 560, h: 560 },
  mini: { w: 360, h: 520 }
};

const defaultStickers = [{ src: "/images/bok.png", label: "BOK" }];
const toolButtonClass =
  "inline-flex py-1 items-center bg-neutral-50 justify-center px-2 text-sm text-neutral-950 transition hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-35";
const selectedToolButtonClass = "bg-neutral-950 text-white";
const MIN_STICKER_WIDTH = 54;
const MIN_TEXT_WIDTH = 90;
const MIN_TEXT_FONT_SIZE = 14;
const RESIZE_HANDLES = {
  nw: { sx: -1, sy: -1 },
  ne: { sx: 1, sy: -1 },
  sw: { sx: -1, sy: 1 },
  se: { sx: 1, sy: 1 }
};

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createPage() {
  return { id: createId(), items: [] };
}

export default function ZineMakerPage() {
  const { t } = useI18n();
  const [currentFormat, setCurrentFormat] = useState("a5");
  const [currentOrientation, setCurrentOrientation] = useState("portrait");
  const [pages, setPages] = useState([createPage()]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [gridOn, setGridOn] = useState(true);
  const [foldOn, setFoldOn] = useState(true);
  const [stickerTray, setStickerTray] = useState(defaultStickers);
  const [selectedTextId, setSelectedTextId] = useState("");
  const [editingTextId, setEditingTextId] = useState("");
  const interactionRef = useRef(null);

  const stageSize = useMemo(() => {
    const base = formats[currentFormat];
    const wide = currentOrientation === "landscape";
    return {
      width: wide ? base.h : base.w,
      height: wide ? base.w : base.h
    };
  }, [currentFormat, currentOrientation]);

  const activePage = pages[activePageIndex];

  function updatePageItems(pageIndex, transform) {
    setPages((currentPages) =>
      currentPages.map((page, index) =>
        index === pageIndex ? { ...page, items: transform(page.items) } : page
      )
    );
  }

  function updateActivePage(transform) {
    updatePageItems(activePageIndex, transform);
  }

  async function addSticker(src) {
    const aspectRatio = await getImageAspectRatio(src);
    updateActivePage((items) => [
      ...items,
      {
        id: createId(),
        type: "image",
        src,
        aspectRatio,
        x: 42 + items.length * 18,
        y: 48 + items.length * 18,
        width: 150
      }
    ]);
  }

  function addText() {
    updateActivePage((items) => [
      ...items,
      {
        id: createId(),
        type: "text",
        text: t("zineMaker.defaultText"),
        x: 42 + items.length * 18,
        y: 48 + items.length * 18,
        width: 180,
        height: 120,
        fontSize: 32
      }
    ]);
  }

  function updateItem(id, nextItem) {
    updateActivePage((items) => items.map((item) => (item.id === id ? { ...item, ...nextItem } : item)));
  }

  function deleteItem(id) {
    updateActivePage((items) => items.filter((item) => item.id !== id));
  }

  function updatePageItem(pageIndex, id, nextItem) {
    updatePageItems(pageIndex, (items) => items.map((item) => (item.id === id ? { ...item, ...nextItem } : item)));
  }

  function deletePageItem(pageIndex, id) {
    updatePageItems(pageIndex, (items) => items.filter((item) => item.id !== id));
  }

  function addPage() {
    setPages((currentPages) => [...currentPages, createPage()]);
    setActivePageIndex(pages.length);
  }

  function removePage() {
    if (pages.length === 1) {
      return;
    }

    setPages((currentPages) => currentPages.filter((_, index) => index !== activePageIndex));
    setActivePageIndex((currentIndex) => Math.max(0, currentIndex - 1));
  }

  function clearActivePage() {
    updateActivePage(() => []);
  }

  useEffect(() => {
    setSelectedTextId("");
    setEditingTextId("");
  }, [activePageIndex]);

  useEffect(() => {
    function handlePointerMove(event) {
      const interaction = interactionRef.current;
      if (!interaction) {
        return;
      }

      if (interaction.kind === "move") {
        const nextX = clamp(
          interaction.startX + (event.clientX - interaction.startClientX),
          0,
          Math.max(0, stageSize.width - interaction.width)
        );
        const nextY = clamp(
          interaction.startY + (event.clientY - interaction.startClientY),
          0,
          Math.max(0, stageSize.height - interaction.height)
        );

        if (
          !interaction.moved &&
          (Math.abs(event.clientX - interaction.startClientX) > 3 ||
            Math.abs(event.clientY - interaction.startClientY) > 3)
        ) {
          interaction.moved = true;
        }

        updatePageItem(interaction.pageIndex, interaction.id, { x: nextX, y: nextY });
        return;
      }

      if (interaction.kind === "resize") {
        const { sx, sy } = RESIZE_HANDLES[interaction.handle];
        const pointerWidth = Math.abs(event.clientX - interaction.anchorClientX);
        const pointerHeight = Math.abs(event.clientY - interaction.anchorClientY) / interaction.aspectRatio;
        const rawWidth = Math.max(pointerWidth, pointerHeight);
        const maxWidthFromX = sx === 1 ? stageSize.width - interaction.anchorX : interaction.anchorX;
        const maxWidthFromY =
          (sy === 1 ? stageSize.height - interaction.anchorY : interaction.anchorY) / interaction.aspectRatio;
        const width = clamp(
          rawWidth,
          interaction.minWidth,
          Math.max(interaction.minWidth, Math.min(maxWidthFromX, maxWidthFromY))
        );
        const height = width * interaction.aspectRatio;
        const x = sx === -1 ? interaction.anchorX - width : interaction.anchorX;
        const y = sy === -1 ? interaction.anchorY - height : interaction.anchorY;
        const nextItem =
          interaction.itemType === "text"
            ? {
                x,
                y,
                width,
                height,
                fontSize: clamp(
                  interaction.startFontSize * (width / interaction.startWidth),
                  MIN_TEXT_FONT_SIZE,
                  400
                )
              }
            : { x, y, width };

        interaction.moved = true;
        updatePageItem(interaction.pageIndex, interaction.id, nextItem);
      }
    }

    function clearInteraction() {
      const interaction = interactionRef.current;
      if (interaction?.kind === "move" && interaction.itemType === "text" && !interaction.moved) {
        setSelectedTextId(interaction.id);
        setEditingTextId("");
      }
      interactionRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", clearInteraction);
    window.addEventListener("pointercancel", clearInteraction);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", clearInteraction);
      window.removeEventListener("pointercancel", clearInteraction);
    };
  }, [stageSize.height, stageSize.width]);

  function beginStickerMove(event, item) {
    if (item.type === "text" && editingTextId === item.id) {
      return;
    }

    event.preventDefault();
    interactionRef.current = {
      kind: "move",
      id: item.id,
      itemType: item.type,
      pageIndex: activePageIndex,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: item.x,
      startY: item.y,
      width: item.width,
      height: getItemHeight(item),
      moved: false
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function beginStickerResize(event, item, handle) {
    event.preventDefault();
    event.stopPropagation();
    const height = getItemHeight(item);
    const anchorX = handle.includes("w") ? item.x + item.width : item.x;
    const anchorY = handle.includes("n") ? item.y + height : item.y;
    const anchorClientX = handle.includes("w") ? event.clientX + item.width : event.clientX - item.width;
    const anchorClientY = handle.includes("n") ? event.clientY + height : event.clientY - height;

    interactionRef.current = {
      kind: "resize",
      id: item.id,
      itemType: item.type,
      pageIndex: activePageIndex,
      handle,
      anchorX,
      anchorY,
      anchorClientX,
      anchorClientY,
      aspectRatio: getItemAspectRatio(item),
      minWidth: item.type === "text" ? MIN_TEXT_WIDTH : MIN_STICKER_WIDTH,
      startWidth: item.width,
      startFontSize: item.fontSize ?? 24
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function syncImageAspect(item, event) {
    const image = event.currentTarget;
    const aspectRatio = image.naturalWidth > 0 ? image.naturalHeight / image.naturalWidth : 1;
    if (Math.abs((item.aspectRatio ?? 1) - aspectRatio) > 0.001) {
      updateItem(item.id, { aspectRatio });
    }
  }

  function onStickerUpload(event) {
    const files = Array.from(event.target.files ?? []);
    files.forEach(async (file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const src = String(reader.result);
        const aspectRatio = await getImageAspectRatio(src);
        setStickerTray((current) => [...current, { src, label: file.name, aspectRatio }]);
      };
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  }

  async function renderPageToCanvas(page) {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = stageSize.width * scale;
    canvas.height = stageSize.height * scale;

    const context = canvas.getContext("2d");
    context.scale(scale, scale);
    context.fillStyle = "#fffef8";
    context.fillRect(0, 0, stageSize.width, stageSize.height);

    if (gridOn) {
      context.strokeStyle = "rgba(0,0,0,0.12)";
      context.lineWidth = 1;
      for (let x = 24; x < stageSize.width; x += 24) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, stageSize.height);
        context.stroke();
      }
      for (let y = 24; y < stageSize.height; y += 24) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(stageSize.width, y);
        context.stroke();
      }
    }

    if (foldOn) {
      context.strokeStyle = "rgba(255,77,0,0.5)";
      context.setLineDash([7, 7]);
      context.beginPath();
      context.moveTo(stageSize.width / 2, 0);
      context.lineTo(stageSize.width / 2, stageSize.height);
      context.moveTo(0, stageSize.height / 2);
      context.lineTo(stageSize.width, stageSize.height / 2);
      context.stroke();
      context.setLineDash([]);
    }

    const drawJobs = page.items.map((item) => {
      if (item.type === "text") {
        context.fillStyle = "#111";
        const fontSize = item.fontSize ?? 24;
        context.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
        context.textBaseline = "top";
        wrapText(context, item.text, item.x, item.y, item.width, fontSize * 1.2);
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          const ratio = image.naturalHeight / image.naturalWidth;
          context.drawImage(image, item.x, item.y, item.width, item.width * ratio);
          resolve();
        };
        image.onerror = resolve;
        image.src = item.src;
      });
    });

    await Promise.all(drawJobs);
    return canvas;
  }

  async function exportAllPages() {
    for (const [pageIndex, page] of pages.entries()) {
      const canvas = await renderPageToCanvas(page);
      const link = document.createElement("a");
      link.download = `bok-zine-page-${pageIndex + 1}-${currentFormat}-${currentOrientation}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      await new Promise((resolve) => window.setTimeout(resolve, 120));
    }
  }

  return (
    <main className="overflow-auto bg-neutral-200 text-neutral-950">
      <div className="grid min-h-screen md:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className="top-0 flex h-auto flex-col gap-7 overflow-auto p-3 pt-20 md:sticky md:h-screen"
          aria-label={t("zineMaker.tools")}
        >
          <div>
            <Eyebrow className="mb-2.5">{t("zineMaker.format")}</Eyebrow>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(formats).map((format) => (
                <button
                  key={format}
                  type="button"
                  className={cx(
                    toolButtonClass,
                    currentFormat === format && selectedToolButtonClass
                  )}
                  onClick={() => setCurrentFormat(format)}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow className="mb-2.5">{t("zineMaker.orientation")}</Eyebrow>
            <div className="grid grid-cols-2 gap-2">
              {["portrait", "landscape"].map((orientation) => (
                <button
                  key={orientation}
                  type="button"
                  className={cx(
                    toolButtonClass,
                    currentOrientation === orientation && selectedToolButtonClass
                  )}
                  onClick={() => setCurrentOrientation(orientation)}
                >
                  {orientation === "portrait" ? t("zineMaker.portrait") : t("zineMaker.landscape")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2.5 flex items-center justify-between gap-2.5">
              <Eyebrow>{`${t("zineMaker.pages")} (${pages.length})`}</Eyebrow>
              
            </div>
            <div className="mb-2 grid grid-cols-4 gap-2">
              {pages.map((page, index) => (
                  <button
                    key={page.id}
                    type="button"
                    className={cx(
                      "h-[38px] text-sm",
                      index === activePageIndex ? "bg-orange-500 text-neutral-950" : "bg-white"
                    )}
                    onClick={() => setActivePageIndex(index)}
                  >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_74px] gap-2">
              <button type="button" className={toolButtonClass} onClick={addPage}>
                {t("zineMaker.addPage")}
              </button>
              <button
                type="button"
                className={toolButtonClass}
                onClick={removePage}
                disabled={pages.length === 1}
              >
                {t("zineMaker.deletePage")}
              </button>
            </div>
          </div>

          <div className="grid">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                spellCheck={false}
                type="checkbox"
                className="accent-neutral-900"
                checked={gridOn}
                onChange={(event) => setGridOn(event.target.checked)}
              />
              <span>{t("zineMaker.grid")}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                className="accent-neutral-900"
                checked={foldOn}
                onChange={(event) => setFoldOn(event.target.checked)}
                spellCheck={false}
              />
              <span>{t("zineMaker.fold")}</span>
            </label>
          </div>

          <div>
            <Eyebrow className="mb-2.5">{t("zineMaker.stickers")}</Eyebrow>
            <div className="mt-2.5 grid min-h-[92px] grid-cols-3 gap-2">
              {stickerTray.map((sticker) => (
                <button
                  key={`${sticker.label}-${sticker.src}`}
                  type="button"
                  className="aspect-square overflow-hidden bg-white"
                  onClick={() => addSticker(sticker.src)}
                >
                  <img className="h-full w-full object-contain" src={sticker.src} alt={sticker.label} />
                </button>
              ))}
            </div>
            <label className={cx(toolButtonClass, "cursor-pointer")}>
              {t("zineMaker.uploadImage")}
              <input
                type="file"
                accept="image/*"
                multiple hidden
                onChange={onStickerUpload}
                spellCheck={false}
              />
            </label>
          </div>

          <div>
            <Eyebrow className="mb-2.5">{t("zineMaker.text")}</Eyebrow>
            <button type="button" className={toolButtonClass} onClick={addText}>
              {t("zineMaker.addText")}
            </button>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <GhostButton onClick={clearActivePage}>
              {t("zineMaker.clearPage")}
            </GhostButton>
            <PrimaryButton onClick={exportAllPages}>
              {t("zineMaker.savePng")}
            </PrimaryButton>
          </div>
        </aside>

        <section
          className="grid min-h-[70vh] min-w-0 justify-items-center overflow-auto p-6 [align-items:start] md:min-h-screen md:place-items-center md:p-12"
          aria-label={t("zineMaker.editor")}
        >
          <div className="origin-top-center scale-[0.72] p-3 md:scale-100 md:p-[30px]">
            <div
              className={cx(
                "relative block overflow-hidden bg-stone-50 transition-[width,height] duration-200",
                gridOn &&
                  "bg-[linear-gradient(90deg,rgba(0,0,0,0.12)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] bg-[size:24px_24px]",
                foldOn &&
                  "before:pointer-events-none before:absolute before:top-0 before:bottom-0 before:left-1/2 before:z-[1] before:border-l before:border-dashed before:border-orange-500/55 after:pointer-events-none after:absolute after:top-1/2 after:right-0 after:left-0 after:z-[1] after:border-t after:border-dashed after:border-orange-500/55"
              )}
              style={{ width: `${stageSize.width}px`, height: `${stageSize.height}px` }}
            >
              {activePage.items.length === 0 ? (
                <p className="pointer-events-none absolute top-7 right-7 left-7 z-[2] max-w-[310px] text-base leading-[1.4] text-neutral-500">
                  {t("zineMaker.emptyHint")}
                </p>
              ) : null}

              {activePage.items.map((item) =>
                item.type === "image" ? (
                  <div
                    key={item.id}
                    className="group absolute z-[5] cursor-move [touch-action:none]"
                    style={{ left: item.x, top: item.y, width: item.width, height: getItemHeight(item) }}
                    onPointerDown={(event) => beginStickerMove(event, item)}
                  >
                    <img
                      className="pointer-events-none block h-full w-full"
                      src={item.src}
                      alt=""
                      draggable="false"
                      onLoad={(event) => syncImageAspect(item, event)}
                    />
                    <div className="pointer-events-none absolute inset-0 border border-black/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                    {Object.keys(RESIZE_HANDLES).map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        aria-label={t("zineMaker.resizeSticker", { handle })}
                        className={cx(
                          "absolute z-[7] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 border border-black/50 bg-white/80 opacity-0 transition-opacity duration-150 hover:opacity-100 group-hover:opacity-100",
                          handle === "nw" && "top-0 left-0 cursor-nwse-resize",
                          handle === "ne" && "top-0 left-full cursor-nesw-resize",
                          handle === "sw" && "top-full left-0 cursor-nesw-resize",
                          handle === "se" && "top-full left-full cursor-nwse-resize"
                        )}
                        onPointerDown={(event) => beginStickerResize(event, item, handle)}
                      />
                    ))}
                    <button
                      type="button"
                      aria-label={t("zineMaker.deleteSticker")}
                      className="absolute -top-3 -right-9 z-[8] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 size={16} strokeWidth={2.1} />
                    </button>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="group absolute z-[5] cursor-move [touch-action:none]"
                    style={{ left: item.x, top: item.y, width: item.width, height: getItemHeight(item) }}
                    onPointerDown={(event) => beginStickerMove(event, item)}
                    onDoubleClick={() => {
                      setSelectedTextId(item.id);
                      setEditingTextId(item.id);
                    }}
                  >
                    <div
                      className={cx(
                        "pointer-events-none absolute inset-0 border border-black/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                        selectedTextId === item.id && "opacity-100"
                      )}
                    />
                    {Object.keys(RESIZE_HANDLES).map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        aria-label={t("zineMaker.resizeText", { handle })}
                        className={cx(
                          "absolute z-[7] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 border border-black/50 bg-white/80 opacity-0 transition-opacity duration-150 hover:opacity-100 group-hover:opacity-100",
                          handle === "nw" && "top-0 left-0 cursor-nwse-resize",
                          handle === "ne" && "top-0 left-full cursor-nesw-resize",
                          handle === "sw" && "top-full left-0 cursor-nesw-resize",
                          handle === "se" && "top-full left-full cursor-nwse-resize",
                          selectedTextId === item.id && "opacity-100"
                        )}
                        onPointerDown={(event) => beginStickerResize(event, item, handle)}
                      />
                    ))}
                    <button
                      type="button"
                      aria-label={t("zineMaker.deleteText")}
                      className={cx(
                        "absolute -top-3 -right-9 z-[8] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 opacity-0 transition hover:text-red-600 group-hover:opacity-100",
                        selectedTextId === item.id && "opacity-100"
                      )}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => deletePageItem(activePageIndex, item.id)}
                    >
                      <Trash2 size={16} strokeWidth={2.1} />
                    </button>
                    {editingTextId === item.id ? (
                      <textarea
                        autoFocus
                        className="h-full w-full resize-none border-0 bg-transparent px-1 py-0.5 text-neutral-950 outline-none"
                        style={{ fontSize: `${item.fontSize ?? 32}px`, lineHeight: 1.2 }}
                        value={item.text}
                        onPointerDown={(event) => event.stopPropagation()}
                        onBlur={() => setEditingTextId("")}
                        onChange={(event) => updatePageItem(activePageIndex, item.id, { text: event.target.value })}
                      />
                    ) : (
                      <div
                        className="h-full w-full overflow-hidden break-words px-1 py-0.5 text-neutral-950 select-none"
                        style={{ fontSize: `${item.fontSize ?? 32}px`, lineHeight: 1.2, whiteSpace: "pre-wrap" }}
                      >
                        {item.text}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    const words = line.split(" ");
    let current = "";

    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (context.measureText(test).width > maxWidth && current) {
        context.fillText(current, x, y);
        y += lineHeight;
        current = word;
      } else {
        current = test;
      }
    });

    context.fillText(current, x, y);
    y += lineIndex < lines.length - 1 ? lineHeight : 0;
  });
}

function getItemHeight(item) {
  if (item.type === "text") {
    return item.height ?? 120;
  }

  return item.width * (item.aspectRatio ?? 1);
}

function getItemAspectRatio(item) {
  if (item.type === "text") {
    return (item.height ?? 120) / item.width;
  }

  return item.aspectRatio ?? 1;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getImageAspectRatio(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth > 0) {
        resolve(image.naturalHeight / image.naturalWidth);
        return;
      }

      resolve(1);
    };
    image.onerror = () => resolve(1);
    image.src = src;
  });
}
