import { cx } from "./ui";
import { formatOptionValue } from "../lib/product-options";
import { useI18n } from "../lib/i18n";

export default function ProductOptionSelector({
  namePrefix = "product-option",
  optionGroups = [],
  selectedOptions = {},
  onChange,
  getGroupLabel,
  isOptionDisabled,
  className = ""
}) {
  const { t } = useI18n();

  if (!optionGroups.length) {
    return null;
  }

  return (
    <div className={cx("flex min-w-0 flex-col gap-2 pb-1", className)}>
      {optionGroups.map(([groupKey, options]) => (
        <fieldset key={groupKey} className="flex min-w-0 flex-wrap items-center gap-1">
          <legend className="shrink-0 text-sm">{getGroupLabel(groupKey)}</legend>
          {options.map((option) => {
            const checked = option === selectedOptions[groupKey];
            const disabled = isOptionDisabled ? isOptionDisabled(groupKey, option) : false;

            return (
              <label
                key={`${groupKey}-${option}`}
                className={cx(
                  "relative inline-flex items-center justify-center border px-2 py-0.5 transition-transform duration-200",
                  checked
                    ? "border-neutral-900 bg-neutral-900 text-neutral-100"
                    : "border-neutral-900 bg-transparent text-neutral-900",
                  disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer hover:-translate-y-0.5"
                )}
              >
                <input
                  className="sr-only text-base"
                  type="radio"
                  name={`${namePrefix}-${groupKey}`}
                  value={option}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onChange(groupKey, option)}
                />
                <span>{formatOptionValue(option)}</span>
              </label>
            );
          })}
        </fieldset>
      ))}
      <p className="text-xs opacity-60">{t("detail.optionImageNotice")}</p>
    </div>
  );
}
