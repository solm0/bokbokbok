import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eyebrow, GhostButton, PrimaryButton, cx } from "../components/ui";

const formats = {
  a5: { w: 420, h: 594 },
  a4: { w: 500, h: 707 },
  square: { w: 560, h: 560 },
  mini: { w: 360, h: 520 }
};

const defaultStickers = [{ src: "/images/bok.png", label: "BOK" }];
const toolButtonClass =
  "inline-flex min-h-[42px] items-center justify-center border border-neutral-950 bg-stone-50 px-3 text-[13px] font-black text-neutral-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35";
const selectedToolButtonClass = "bg-neutral-950 text-white";
const miniEditorButtonClass =
  "h-7 w-7 border border-neutral-950 bg-white text-sm font-black";

function createPage() {
  return { id: crypto.randomUUID(), items: [] };
}

export default function ZineMakerPage() {
  const [currentFormat, setCurrentFormat] = useState("a5");
  const [currentOrientation, setCurrentOrientation] = useState("portrait");
  const [pages, setPages] = useState([createPage()]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [gridOn, setGridOn] = useState(true);
  const [foldOn, setFoldOn] = useState(true);
  const [stickerTray, setStickerTray] = useState(defaultStickers);

  const stageSize = useMemo(() => {
    const base = formats[currentFormat];
    const wide = currentOrientation === "landscape";
    return {
      width: wide ? base.h : base.w,
      height: wide ? base.w : base.h
    };
  }, [currentFormat, currentOrientation]);

  const activePage = pages[activePageIndex];

  function updateActivePage(transform) {
    setPages((currentPages) =>
      currentPages.map((page, index) =>
        index === activePageIndex ? { ...page, items: transform(page.items) } : page
      )
    );
  }

  function addSticker(src) {
    updateActivePage((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        type: "image",
        src,
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
        id: crypto.randomUUID(),
        type: "text",
        text: "텍스트",
        x: 42 + items.length * 18,
        y: 48 + items.length * 18,
        width: 180
      }
    ]);
  }

  function updateItem(id, nextItem) {
    updateActivePage((items) => items.map((item) => (item.id === id ? { ...item, ...nextItem } : item)));
  }

  function deleteItem(id) {
    updateActivePage((items) => items.filter((item) => item.id !== id));
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

  function onStickerUpload(event) {
    const files = Array.from(event.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setStickerTray((current) => [...current, { src: String(reader.result), label: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  }

  function exportCurrentPage() {
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

    const drawJobs = activePage.items.map((item) => {
      if (item.type === "text") {
        context.fillStyle = "#111";
        context.font = "900 24px Inter, Arial, sans-serif";
        context.textBaseline = "top";
        wrapText(context, item.text, item.x, item.y, item.width, 30);
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

    Promise.all(drawJobs).then(() => {
      const link = document.createElement("a");
      link.download = `bok-zine-page-${activePageIndex + 1}-${currentFormat}-${currentOrientation}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  return (
    <main className="overflow-auto bg-stone-200 text-neutral-950">
      <div className="grid min-h-screen md:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className="top-0 flex h-auto flex-col gap-6 overflow-auto border-b border-neutral-950 bg-stone-100 p-7 md:sticky md:h-screen md:border-r md:border-b-0"
          aria-label="Zine tools"
        >
          <Link className="text-4xl leading-none font-black no-underline" to="/">
            BOK³
          </Link>

          <div>
            <Eyebrow className="mb-2.5">판형</Eyebrow>
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
            <Eyebrow className="mb-2.5">방향</Eyebrow>
            <div className="grid grid-cols-2">
              {["portrait", "landscape"].map((orientation) => (
                <button
                  key={orientation}
                  type="button"
                  className={cx(
                    toolButtonClass,
                    orientation === "landscape" && "border-l-0",
                    currentOrientation === orientation && selectedToolButtonClass
                  )}
                  onClick={() => setCurrentOrientation(orientation)}
                >
                  {orientation === "portrait" ? "세로" : "가로"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2.5 flex items-center justify-between gap-2.5">
              <Eyebrow>페이지</Eyebrow>
              <span className="text-[11px] font-black text-neutral-500">
                {pages.length} page{pages.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="mb-2 grid grid-cols-4 gap-2">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  type="button"
                  className={cx(
                    "h-[38px] border border-neutral-950 bg-stone-50 text-xs font-black",
                    index === activePageIndex && "bg-orange-500 text-neutral-950"
                  )}
                  onClick={() => setActivePageIndex(index)}
                >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_74px] gap-2">
              <button type="button" className={toolButtonClass} onClick={addPage}>
                페이지 추가
              </button>
              <button
                type="button"
                className={toolButtonClass}
                onClick={removePage}
                disabled={pages.length === 1}
              >
                삭제
              </button>
            </div>
          </div>

          <div className="grid gap-2.5">
            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-bold">
              <input type="checkbox" checked={gridOn} onChange={(event) => setGridOn(event.target.checked)} />
              <span>그리드</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-bold">
              <input type="checkbox" checked={foldOn} onChange={(event) => setFoldOn(event.target.checked)} />
              <span>접지선</span>
            </label>
          </div>

          <div>
            <Eyebrow className="mb-2.5">기본 / 스케치 스티커</Eyebrow>
            <label className={cx(toolButtonClass, "cursor-pointer")}>
              이미지 불러오기
              <input type="file" accept="image/*" multiple onChange={onStickerUpload} />
            </label>
            <div className="mt-2.5 grid min-h-[92px] grid-cols-3 gap-2">
              {stickerTray.map((sticker) => (
                <button
                  key={`${sticker.label}-${sticker.src}`}
                  type="button"
                  className="aspect-square overflow-hidden border border-neutral-950 bg-white"
                  onClick={() => addSticker(sticker.src)}
                >
                  <img className="h-full w-full object-contain" src={sticker.src} alt={sticker.label} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow className="mb-2.5">텍스트</Eyebrow>
            <button type="button" className={toolButtonClass} onClick={addText}>
              텍스트 추가
            </button>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <PrimaryButton onClick={exportCurrentPage}>
              현재 PNG 저장
            </PrimaryButton>
            <GhostButton onClick={clearActivePage}>
              비우기
            </GhostButton>
          </div>
        </aside>

        <section
          className="grid min-h-[70vh] min-w-0 justify-items-center overflow-auto bg-[linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:32px_32px] bg-slate-300 p-6 [align-items:start] md:min-h-screen md:place-items-center md:p-12"
          aria-label="Zine editor"
        >
          <div className="origin-top-center scale-[0.72] p-3 md:scale-100 md:p-[30px]">
            <div
              className={cx(
                "relative block overflow-hidden border border-neutral-950 bg-stone-50 shadow-[14px_18px_0_rgba(0,0,0,0.18)] transition-[width,height] duration-200",
                gridOn &&
                  "bg-[linear-gradient(90deg,rgba(0,0,0,0.12)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] bg-[size:24px_24px]",
                foldOn &&
                  "before:pointer-events-none before:absolute before:top-0 before:bottom-0 before:left-1/2 before:z-[1] before:border-l before:border-dashed before:border-orange-500/55 after:pointer-events-none after:absolute after:top-1/2 after:right-0 after:left-0 after:z-[1] after:border-t after:border-dashed after:border-orange-500/55"
              )}
              style={{ width: `${stageSize.width}px`, height: `${stageSize.height}px` }}
            >
              {activePage.items.length === 0 ? (
                <p className="pointer-events-none absolute top-7 right-7 left-7 z-[2] max-w-[310px] text-lg leading-[1.25] font-black text-neutral-500">
                  이미지를 불러오거나 텍스트를 추가해서 진을 만들어봐
                </p>
              ) : null}

              {activePage.items.map((item) =>
                item.type === "image" ? (
                  <div
                    key={item.id}
                    className="absolute z-[5] [touch-action:none]"
                    style={{ left: item.x, top: item.y, width: item.width }}
                  >
                    <img
                      className="pointer-events-none block h-auto w-full drop-shadow-[5px_6px_0_rgba(0,0,0,0.16)]"
                      src={item.src}
                      alt=""
                    />
                    <div className="absolute top-[calc(100%+8px)] left-0 z-[8] flex flex-wrap gap-1 border border-neutral-950 bg-stone-50 p-1.5">
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { x: item.x - 12 })}>
                        ←
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { x: item.x + 12 })}>
                        →
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { y: item.y - 12 })}>
                        ↑
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { y: item.y + 12 })}>
                        ↓
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { width: item.width + 16 })}>
                        +
                      </button>
                      <button
                        className={miniEditorButtonClass}
                        type="button"
                        onClick={() => updateItem(item.id, { width: Math.max(54, item.width - 16) })}
                      >
                        -
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => deleteItem(item.id)}>
                        x
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="absolute z-[5] min-h-[34px] break-words px-1 py-0.5 text-2xl leading-[1.14] font-black [touch-action:none]"
                    style={{ left: item.x, top: item.y, width: item.width }}
                  >
                    <textarea
                      className="min-h-[120px] w-full resize-none border-0 bg-transparent text-2xl leading-[1.14] font-black text-neutral-950 outline-none"
                      value={item.text}
                      onChange={(event) => updateItem(item.id, { text: event.target.value })}
                    />
                    <div className="absolute top-[calc(100%+8px)] left-0 z-[8] flex flex-wrap gap-1 border border-neutral-950 bg-stone-50 p-1.5">
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { x: item.x - 12 })}>
                        ←
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { x: item.x + 12 })}>
                        →
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { y: item.y - 12 })}>
                        ↑
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { y: item.y + 12 })}>
                        ↓
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => updateItem(item.id, { width: item.width + 16 })}>
                        +
                      </button>
                      <button
                        className={miniEditorButtonClass}
                        type="button"
                        onClick={() => updateItem(item.id, { width: Math.max(90, item.width - 16) })}
                      >
                        -
                      </button>
                      <button className={miniEditorButtonClass} type="button" onClick={() => deleteItem(item.id)}>
                        x
                      </button>
                    </div>
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
