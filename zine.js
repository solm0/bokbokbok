let stage = document.getElementById("zineStage");
const stickerInput = document.getElementById("stickerInput");
const stickerTray = document.getElementById("stickerTray");
const addTextBtn = document.getElementById("addTextBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");
const pageList = document.getElementById("pageList");
const addPageBtn = document.getElementById("addPageBtn");
const deletePageBtn = document.getElementById("deletePageBtn");
const pageTotalLabel = document.getElementById("pageTotalLabel");
const gridToggle = document.getElementById("gridToggle");
const foldToggle = document.getElementById("foldToggle");
const formatButtons = document.querySelectorAll("[data-format]");
const orientationButtons = document.querySelectorAll("[data-orientation]");
const stageWrap = document.querySelector(".zine-stage-wrap");

const formats = {
  a5: { w: 420, h: 594 },
  a4: { w: 500, h: 707 },
  square: { w: 560, h: 560 },
  mini: { w: 360, h: 520 }
};

const defaultStickers = [
  { src: "images/bok.png", label: "BOK" }
];

let currentFormat = "a5";
let currentOrientation = "portrait";
let activeItem = null;
let dragState = null;
let pages = [stage];
let activePageIndex = 0;

function setStageSize() {
  const base = formats[currentFormat];
  const wide = currentOrientation === "landscape";
  pages.forEach((page) => {
    page.style.width = `${wide ? base.h : base.w}px`;
    page.style.height = `${wide ? base.w : base.h}px`;
    page.dataset.format = currentFormat;
    page.dataset.orientation = currentOrientation;
  });
}

function updateEmptyNote() {
  const note = stage.querySelector(".empty-note");
  if (note) note.hidden = stage.querySelectorAll(".zine-item").length > 0;
}

function updateAllEmptyNotes() {
  pages.forEach((page) => {
    const note = page.querySelector(".empty-note");
    if (note) note.hidden = page.querySelectorAll(".zine-item").length > 0;
  });
}

function selectItem(item) {
  pages.forEach((page) => {
    page.querySelectorAll(".zine-item").forEach((node) => node.classList.remove("selected"));
  });
  activeItem = item;
  if (activeItem) activeItem.classList.add("selected");
}

function renderPageList() {
  pageList.innerHTML = "";
  pages.forEach((page, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-tab";
    button.classList.toggle("selected", index === activePageIndex);
    button.innerText = String(index + 1).padStart(2, "0");
    button.onclick = () => showPage(index);
    pageList.appendChild(button);
  });
  pageTotalLabel.innerText = `${pages.length} page${pages.length > 1 ? "s" : ""}`;
  deletePageBtn.disabled = pages.length === 1;
}

function showPage(index) {
  activePageIndex = index;
  stage = pages[activePageIndex];
  pages.forEach((page, pageIndex) => {
    page.classList.toggle("active-page", pageIndex === activePageIndex);
  });
  selectItem(null);
  updateEmptyNote();
  renderPageList();
}

function createPage() {
  const page = document.createElement("div");
  page.className = `zine-stage ${gridToggle.checked ? "grid-on" : ""} ${foldToggle.checked ? "fold-on" : ""}`;
  page.dataset.format = currentFormat;
  page.dataset.orientation = currentOrientation;
  page.innerHTML = `<p class="empty-note">이미지를 불러오거나 텍스트를 추가해서 진을 만들어봐</p>`;
  page.addEventListener("pointerdown", (event) => {
    if (event.target === page) selectItem(null);
  });
  stageWrap.appendChild(page);
  pages.push(page);
  setStageSize();
  showPage(pages.length - 1);
}

function deleteCurrentPage() {
  if (pages.length === 1) return;
  const removed = pages.splice(activePageIndex, 1)[0];
  removed.remove();
  showPage(Math.max(0, activePageIndex - 1));
}

function makeDraggable(item) {
  item.addEventListener("pointerdown", (event) => {
    if (event.target.classList.contains("resize-handle")) return;
    selectItem(item);
    item.setPointerCapture(event.pointerId);
    dragState = {
      type: "move",
      item,
      startX: event.clientX,
      startY: event.clientY,
      left: item.offsetLeft,
      top: item.offsetTop
    };
  });

  item.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.item !== item || dragState.type !== "move") return;
    item.style.left = `${dragState.left + event.clientX - dragState.startX}px`;
    item.style.top = `${dragState.top + event.clientY - dragState.startY}px`;
  });

  item.addEventListener("pointerup", () => {
    dragState = null;
  });
}

function addResizeHandle(item) {
  const handle = document.createElement("span");
  handle.className = "resize-handle";
  handle.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    selectItem(item);
    handle.setPointerCapture(event.pointerId);
    dragState = {
      type: "resize",
      item,
      startX: event.clientX,
      width: item.offsetWidth
    };
  });
  handle.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.item !== item || dragState.type !== "resize") return;
    const nextWidth = Math.max(54, dragState.width + event.clientX - dragState.startX);
    item.style.width = `${nextWidth}px`;
  });
  handle.addEventListener("pointerup", () => {
    dragState = null;
  });
  item.appendChild(handle);
}

function placeItem(item) {
  const count = stage.querySelectorAll(".zine-item").length;
  item.classList.add("zine-item");
  item.style.left = `${42 + count * 18}px`;
  item.style.top = `${48 + count * 18}px`;
  item.style.zIndex = String(20 + count);
  makeDraggable(item);
  addResizeHandle(item);
  stage.appendChild(item);
  selectItem(item);
  updateEmptyNote();
}

function addSticker(src) {
  const item = document.createElement("div");
  item.className = "sticker-item";
  item.style.width = "150px";
  item.innerHTML = `<img src="${src}" alt="">`;
  placeItem(item);
}

function addText() {
  const item = document.createElement("div");
  item.className = "text-item";
  item.contentEditable = "true";
  item.spellcheck = false;
  item.style.width = "180px";
  item.innerText = "텍스트";
  placeItem(item);
  item.focus();
}

function addStickerThumb(src) {
  const thumb = document.createElement("button");
  thumb.type = "button";
  thumb.className = "sticker-thumb";
  thumb.innerHTML = `<img src="${src}" alt="">`;
  thumb.onclick = () => addSticker(src);
  stickerTray.appendChild(thumb);
}

function addDefaultStickers() {
  defaultStickers.forEach((sticker) => addStickerThumb(sticker.src, sticker.label));
}

stickerInput.addEventListener("change", () => {
  Array.from(stickerInput.files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => addStickerThumb(reader.result);
    reader.readAsDataURL(file);
  });
  stickerInput.value = "";
});

formatButtons.forEach((button) => {
  button.onclick = () => {
    formatButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    currentFormat = button.dataset.format;
    setStageSize();
  };
});

orientationButtons.forEach((button) => {
  button.onclick = () => {
    orientationButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    currentOrientation = button.dataset.orientation;
    setStageSize();
  };
});

gridToggle.onchange = () => {
  pages.forEach((page) => page.classList.toggle("grid-on", gridToggle.checked));
};
foldToggle.onchange = () => {
  pages.forEach((page) => page.classList.toggle("fold-on", foldToggle.checked));
};
addTextBtn.onclick = addText;
addPageBtn.onclick = createPage;
deletePageBtn.onclick = deleteCurrentPage;

clearBtn.onclick = () => {
  stage.querySelectorAll(".zine-item").forEach((item) => item.remove());
  selectItem(null);
  updateEmptyNote();
};

exportBtn.onclick = () => {
  selectItem(null);
  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = stage.offsetWidth * scale;
  canvas.height = stage.offsetHeight * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#fffef8";
  ctx.fillRect(0, 0, stage.offsetWidth, stage.offsetHeight);

  if (gridToggle.checked) {
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    for (let x = 24; x < stage.offsetWidth; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, stage.offsetHeight);
      ctx.stroke();
    }
    for (let y = 24; y < stage.offsetHeight; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(stage.offsetWidth, y);
      ctx.stroke();
    }
  }

  if (foldToggle.checked) {
    ctx.strokeStyle = "rgba(255,77,0,0.5)";
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.moveTo(stage.offsetWidth / 2, 0);
    ctx.lineTo(stage.offsetWidth / 2, stage.offsetHeight);
    ctx.moveTo(0, stage.offsetHeight / 2);
    ctx.lineTo(stage.offsetWidth, stage.offsetHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const drawJobs = Array.from(stage.querySelectorAll(".zine-item")).map((item) => {
    if (item.classList.contains("text-item")) {
      ctx.fillStyle = "#111";
      ctx.font = "900 24px Inter, Arial, sans-serif";
      ctx.textBaseline = "top";
      wrapText(ctx, item.innerText, item.offsetLeft, item.offsetTop, item.offsetWidth, 30);
      return Promise.resolve();
    }

    const img = item.querySelector("img");
    return new Promise((resolve) => {
      const exportImg = new Image();
      exportImg.onload = () => {
        const ratio = exportImg.naturalHeight / exportImg.naturalWidth;
        ctx.drawImage(exportImg, item.offsetLeft, item.offsetTop, item.offsetWidth, item.offsetWidth * ratio);
        resolve();
      };
      exportImg.onerror = resolve;
      exportImg.src = img.src;
    });
  });

  Promise.all(drawJobs).then(() => {
    const link = document.createElement("a");
    link.download = `bok-zine-page-${activePageIndex + 1}-${currentFormat}-${currentOrientation}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
};

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = text.split("\n");
  lines.forEach((line, lineIndex) => {
    const words = line.split(" ");
    let current = "";
    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        ctx.fillText(current, x, y);
        y += lineHeight;
        current = word;
      } else {
        current = test;
      }
    });
    ctx.fillText(current, x, y);
    y += lineIndex < lines.length - 1 ? lineHeight : 0;
  });
}

document.addEventListener("keydown", (event) => {
  const typingInText = activeItem && activeItem.contentEditable === "true" && document.activeElement === activeItem;
  if ((event.key === "Backspace" || event.key === "Delete") && activeItem && !typingInText) {
    activeItem.remove();
    activeItem = null;
    updateEmptyNote();
  }
});

stage.addEventListener("pointerdown", (event) => {
  if (event.target === stage) selectItem(null);
});

setStageSize();
stage.classList.add("active-page");
addDefaultStickers();
renderPageList();
