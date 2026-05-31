const localeByLanguage = {
  ko: "ko-KR",
  en: "en-US"
};

export function formatPrice(value, language = "ko") {
  return new Intl.NumberFormat(localeByLanguage[language] ?? localeByLanguage.ko, {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
}
