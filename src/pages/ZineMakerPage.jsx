import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const formats = {
  a5: { w: 420, h: 594 },
  a4: { w: 500, h: 707 },
  square: { w: 560, h: 560 },
  mini: { w: 360, h: 520 }
};

const defaultStickers = [{ src: "/images/bok.png", label: "BOK" }];

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
    <main className="zine-body">
      <div className="zine-maker">
        <aside className="zine-tools" aria-label="Zine tools">
          <Link className="zine-home" to="/">
            BOK³
          </Link>

          <div>
            <p className="tool-label">판형</p>
            <div className="format-grid">
              {Object.keys(formats).map((format) => (
                <button
                  key={format}
                  type="button"
                  className={`format-btn ${currentFormat === format ? "selected" : ""}`}
                  onClick={() => setCurrentFormat(format)}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="tool-label">방향</p>
            <div className="segmented">
              {["portrait", "landscape"].map((orientation) => (
                <button
                  key={orientation}
                  type="button"
                  className={`segment-btn ${currentOrientation === orientation ? "selected" : ""}`}
                  onClick={() => setCurrentOrientation(orientation)}
                >
                  {orientation === "portrait" ? "세로" : "가로"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="tool-label-row">
              <p className="tool-label">페이지</p>
              <span>{pages.length} page{pages.length > 1 ? "s" : ""}</span>
            </div>
            <div className="page-list">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  type="button"
                  className={`page-tab ${index === activePageIndex ? "selected" : ""}`}
                  onClick={() => setActivePageIndex(index)}
                >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <div className="page-actions">
              <button type="button" className="tool-btn" onClick={addPage}>
                페이지 추가
              </button>
              <button type="button" className="tool-btn" onClick={removePage} disabled={pages.length === 1}>
                삭제
              </button>
            </div>
          </div>

          <div className="tool-row">
            <label className="toggle-line">
              <input type="checkbox" checked={gridOn} onChange={(event) => setGridOn(event.target.checked)} />
              <span>그리드</span>
            </label>
            <label className="toggle-line">
              <input type="checkbox" checked={foldOn} onChange={(event) => setFoldOn(event.target.checked)} />
              <span>접지선</span>
            </label>
          </div>

          <div>
            <p className="tool-label">기본 / 스케치 스티커</p>
            <label className="upload-btn">
              이미지 불러오기
              <input type="file" accept="image/*" multiple onChange={onStickerUpload} />
            </label>
            <div className="sticker-tray">
              {stickerTray.map((sticker) => (
                <button
                  key={`${sticker.label}-${sticker.src}`}
                  type="button"
                  className="sticker-thumb"
                  onClick={() => addSticker(sticker.src)}
                >
                  <img src={sticker.src} alt={sticker.label} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="tool-label">텍스트</p>
            <button type="button" className="tool-btn" onClick={addText}>
              텍스트 추가
            </button>
          </div>

          <div className="tool-actions">
            <button type="button" className="tool-btn dark" onClick={exportCurrentPage}>
              현재 PNG 저장
            </button>
            <button type="button" className="tool-btn" onClick={clearActivePage}>
              비우기
            </button>
          </div>
        </aside>

        <section className="zine-workspace" aria-label="Zine editor">
          <div className="zine-stage-wrap">
            <div
              className={`zine-stage active-page ${gridOn ? "grid-on" : ""} ${foldOn ? "fold-on" : ""}`}
              style={{ width: `${stageSize.width}px`, height: `${stageSize.height}px` }}
            >
              {activePage.items.length === 0 ? (
                <p className="empty-note">이미지를 불러오거나 텍스트를 추가해서 진을 만들어봐</p>
              ) : null}

              {activePage.items.map((item) =>
                item.type === "image" ? (
                  <div
                    key={item.id}
                    className="zine-item sticker-item"
                    style={{ left: item.x, top: item.y, width: item.width }}
                  >
                    <img src={item.src} alt="" />
                    <div className="mini-editor">
                      <button type="button" onClick={() => updateItem(item.id, { x: item.x - 12 })}>
                        ←
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { x: item.x + 12 })}>
                        →
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { y: item.y - 12 })}>
                        ↑
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { y: item.y + 12 })}>
                        ↓
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { width: item.width + 16 })}>
                        +
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { width: Math.max(54, item.width - 16) })}>
                        -
                      </button>
                      <button type="button" onClick={() => deleteItem(item.id)}>
                        x
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="zine-item text-item"
                    style={{ left: item.x, top: item.y, width: item.width }}
                  >
                    <textarea
                      className="text-editor"
                      value={item.text}
                      onChange={(event) => updateItem(item.id, { text: event.target.value })}
                    />
                    <div className="mini-editor">
                      <button type="button" onClick={() => updateItem(item.id, { x: item.x - 12 })}>
                        ←
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { x: item.x + 12 })}>
                        →
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { y: item.y - 12 })}>
                        ↑
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { y: item.y + 12 })}>
                        ↓
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { width: item.width + 16 })}>
                        +
                      </button>
                      <button type="button" onClick={() => updateItem(item.id, { width: Math.max(90, item.width - 16) })}>
                        -
                      </button>
                      <button type="button" onClick={() => deleteItem(item.id)}>
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
