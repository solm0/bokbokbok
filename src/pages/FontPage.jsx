import { useMemo, useState } from "react";
import { useI18n } from "../lib/i18n";

const FONT_PATH = "/fonts/lazy.otf";

export default function FontPage() {
  const { t } = useI18n();
  const [previewText, setPreviewText] = useState(t("font.previewText"));
  const previewLetters = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), []);

  return (
    <main className="app-page-shell relative flex flex-col overflow-hidden px-4 pt-24 pb-8 md:px-7 md:pt-28">
      <section className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-9 overflow-y-auto pb-20">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-2">
            <h1 className="font-lazy-preview text-7xl leading-none md:text-9xl">Lazy</h1>
            <p className="max-w-[38ch] text-lg leading-[1.45] opacity-70 md:text-xl">
              {t("font.description")}
            </p>
          </div>
          <a
            className="inline-flex w-fit items-center justify-center bg-neutral-950 px-4 py-3 text-base leading-none text-white transition hover:-translate-y-0.5 hover:opacity-85"
            href={FONT_PATH}
            download="lazy.otf"
          >
            {t("font.download")}
          </a>
        </header>

        <div className="grid gap-3">
          <label className="sr-only" htmlFor="font-preview">
            {t("font.previewLabel")}
          </label>
          <input
            id="font-preview"
            className="w-full border-0 border-b border-dotted border-neutral-950 bg-transparent px-0 py-2 text-xl outline-none placeholder:text-neutral-500"
            value={previewText}
            onChange={(event) => setPreviewText(event.target.value)}
            placeholder={t("font.previewPlaceholder")}
            spellCheck={false}
          />
          <p className="font-lazy-preview break-words text-5xl leading-[1.05] md:text-8xl">
            {previewText || t("font.previewPlaceholder")}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-x-4 gap-y-5 border-t border-dotted border-neutral-950 pt-6 font-lazy-preview text-5xl leading-none md:grid-cols-8 md:text-7xl">
          {previewLetters.map((letter) => (
            <span key={letter}>{letter}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
