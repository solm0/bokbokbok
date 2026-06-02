import { Panel } from "../components/ui";
import { useI18n } from "../lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen flex items-center">
      <Panel className="w-auto p-4 md:p-7 lg:p-18 flex flex-col gap-7 transition-all">
        <p className="max-w-[30ch] leading-[1.55] text-3xl md:text-4xl">
          {t("about.body")}
        </p>
        <a href="https://www.instagram.com/bok3books/" className="w-6 h-6 md:w-8 md:h-8">
          <img src="/images/insta.png" />
        </a>
      </Panel>
    </main>
  );
}
