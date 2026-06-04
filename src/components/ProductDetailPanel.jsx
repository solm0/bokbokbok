import { Link } from "react-router-dom";
import ZineImage from "./ZineImage";
import { cx, Panel, PrimaryButton } from "./ui";
import { formatPrice } from "../lib/format";
import { getProductImageBackgroundClass } from "../lib/product-display";

export default function ProductDetailPanel({
  item,
  subtitle,
  language = "ko",
  availabilityLabel,
  actionLabel,
  actionDisabled = false,
  onAction,
  headerAction,
  detailPath,
  className = "",
  imageBackgroundClassName,
  short = false,
  smallImage = false,
  overlayClassName = "",
}) {
  const imageClassName = cx(
    "aspect-3/4 object-contain p-3",
    smallImage ? 'w-1/2 md:w-full': 'w-full',
    imageBackgroundClassName ?? getProductImageBackgroundClass(item)
  );
  const descriptionLines = Array.isArray(item.description)
    ? item.description.filter(Boolean)
    : item.description
      ? [item.description]
      : [];
  const image = <ZineImage className={imageClassName} src={item.cover} alt={item.title} />;
  const resolvedHeaderAction =
    headerAction ??
    (actionLabel ? (
      <PrimaryButton onClick={onAction} disabled={item.available === false || actionDisabled}>
        {actionLabel}
      </PrimaryButton>
    ) : null);
  const title = detailPath ? (
    <Link to={detailPath} className="inline-block leading-[1.35] underline underline-offset-4 decoration-dotted decoration-1 hover:opacity-50">
      {item.title}
    </Link>
  ) : (
    <h1 className="font-bold leading-[1.35]">{item.title}</h1>
  );

  return (
    <Panel
      className={cx(
        "relative grid min-w-0 h-full content-start items-start gap-3 text-sm md:gap-5 md:grid-cols-[160px_minmax(0,1fr)]",
        className
      )}
    >
      {detailPath ? (
        <Link to={detailPath} className="block min-w-0 w-full overflow-hidden">
          {image}
        </Link>
      ) : (
        image
      )}
      <div className="flex min-w-0 flex-col gap-3 md:gap-[1.4em]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="text-lg">{title}</div>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {resolvedHeaderAction ? (
            <div className="shrink-0 self-start text-right">{resolvedHeaderAction}</div>
          ) : null}
        </div>
        {descriptionLines.length && !short ? (
          <div className="flex max-w-[42ch] flex-col gap-2 break-words break-keep leading-[1.45]">
            {descriptionLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        ) : null}
        {item.metadata?.length && !short ? (
          <div className="flex flex-col gap-0.5">
            {item.metadata?.map((entry, index) => (
              <span key={index}>{entry}</span>
            ))}
          </div>
        ) : null}
        {availabilityLabel ? <p>{availabilityLabel}</p> : null}
        <p>{formatPrice(item.price, language)}</p>
      </div>
      {overlayClassName ? <div className={cx("pointer-events-none absolute inset-0", overlayClassName)} /> : null}
    </Panel>
  );
}
