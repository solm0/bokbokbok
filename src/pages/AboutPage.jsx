import { useEffect, useState } from "react";
import AnimatedMice from "../components/AnimatedMice";
import { Panel, cx } from "../components/ui";
import { useI18n } from "../lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();
  const [butterflyFacing, setButterflyFacing] = useState(1);
  const aboutMouseConfig = [
    {
      id: "about-mouse",
      src: "/images/ilovezinemouse.png",
      delayMs: 320,
      bottom: "0px",
      scale: 1,
    },
  ];

  useEffect(() => {
    let timeoutId = 0;
    let cancelled = false;

    const loop = () => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        setButterflyFacing((current) => current * -1);
        loop();
      }, 900 + Math.round(Math.random() * 1800));
    };

    loop();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden px-4 py-16 md:px-7 md:py-20 lg:px-18">
      <Panel className="relative z-10 w-auto flex flex-col gap-7 transition-all">
        <div className="relative w-fit">
          <img
            src="/images/butterfly.png"
            alt=""
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute -top-10 right-[8%] w-16 origin-center transition-transform duration-700 ease-in-out md:-top-12 md:w-20",
              butterflyFacing === 1 ? "scale-x-100 rotate-12" : "-scale-x-100 -rotate-6"
            )}
          />
          <p className="max-w-[30ch] leading-[1.55] text-3xl md:text-4xl">
            {t("about.body")}
          </p>
        </div>
        <a href="https://www.instagram.com/bok3books/" className="w-6 h-6 md:w-8 md:h-8">
          <img src="/images/insta.png" />
        </a>
      </Panel>
      <AnimatedMice
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 overflow-visible md:h-36"
        imageConfigs={aboutMouseConfig}
        imageClassName="about-mouse"
      />
    </main>
  );
}
