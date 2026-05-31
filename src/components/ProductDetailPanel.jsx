import ZineImage from "./ZineImage";
import { Panel, PrimaryButton } from "./ui";
import { formatPrice } from "../lib/format";

export default function ProductDetailPanel({
  item,
  subtitle,
  language = "ko",
  availabilityLabel,
  actionLabel,
  actionDisabled = false,
  onAction
}) {
  return (
    <Panel className="grid gap-5 p-6 text-sm md:grid-cols-[160px_minmax(0,1fr)]">
      <ZineImage
        className="aspect-square w-full object-contain"
        src={item.cover}
        alt={item.title}
      />
      <div className="flex flex-col gap-[1.6em]">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold">{item.title}</h1>
          <h1>{subtitle}</h1>
        </div>
        <p className="max-w-[42ch] break-keep">{item.description}</p>
        {item.metadata &&
          item.metadata?.map((entry, index) => (
            <span key={index}>{entry}</span>
          ))
        }
        <p>{availabilityLabel}</p>
        <p>{formatPrice(item.price, language)}</p>
        {actionLabel ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <PrimaryButton onClick={onAction} disabled={item.available === false || actionDisabled}>
              {actionLabel}
            </PrimaryButton>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
