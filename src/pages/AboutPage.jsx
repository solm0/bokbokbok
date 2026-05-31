import { Panel } from "../components/ui";
import { useI18n } from "../lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <main className="grid min-h-screen place-items-center">
      <Panel className="w-full max-w-[720px] p-7 pt-14 flex flex-col gap-7">
        <p className="max-w-[42ch] leading-[1.55]">
          {t("about.body")}
        </p>
        <a href="https://www.instagram.com/bok3books/">{t("about.instagram")}</a>
      </Panel>
    </main>
  );
}
