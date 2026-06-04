import { useOutletContext } from "react-router-dom";
import AnimatedMice from "../components/AnimatedMice";
import { useI18n } from "../lib/i18n";

export default function HomePage() {
  const { toggleNav } = useOutletContext();
  const { t } = useI18n();

  return (
    <div className="relative min-h-screen overflow-visible">
      <button
        type="button"
        className="fixed inset-0 z-10 grid cursor-pointer place-items-center border-0 bg-transparent p-0 outline-none"
        role="button"
        aria-label={t("home.toggleMenu")}
        onClick={toggleNav}
      >
        <img
          src="/images/logo.png"
          alt="BOK3 Zine"
          className="w-[20vh]"
        />
      </button>
      <AnimatedMice className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-36 overflow-visible" />
    </div>
  );
}
