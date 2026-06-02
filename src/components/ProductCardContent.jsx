import ZineImage from "./ZineImage";
import { cx } from "./ui";

export default function ProductCardContent({
  title,
  subtitle,
  cover,
  mode = "grid",
  imageBackgroundClassName = "bg-neutral-900"
}) {
  const isGrid = mode === "grid";

  return (
    <>
      <span
        className={cx(
          "block transition duration-200 group-hover:opacity-80",
          isGrid
            ? `aspect-3/4 overflow-hidden ${imageBackgroundClassName}`
            : "flex aspect-square items-center justify-center overflow-visible"
        )}
      >
        <ZineImage
          className={cx(isGrid ? "h-full w-full object-contain p-3" : "h-auto w-full max-w-none")}
          src={cover}
          alt={title}
        />
      </span>
      {isGrid ? (
        <>
          <span className="mt-2 text-xs font-bold">{title}</span>
          <span className="text-xs opacity-70">{subtitle}</span>
        </>
      ) : null}
    </>
  );
}
