import { useState } from "react";
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
  const [isTallPortrait, setIsTallPortrait] = useState(false);

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
          className={cx(
            isGrid
              ? "h-full w-full object-contain p-3"
              : isTallPortrait
                ? "max-h-full max-w-full scale-[0.55] object-contain"
                : "max-h-full max-w-full object-contain"
          )}
          src={cover}
          alt={title}
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (!naturalWidth || !naturalHeight) {
              return;
            }

            setIsTallPortrait(naturalHeight / naturalWidth > 1.45);
          }}
        />
      </span>
      {isGrid ? (
        <>
          <span className="mt-2 text-xs font-bold">{title}</span>
          {subtitle ? <span className="text-xs opacity-70">{subtitle}</span> : null}
        </>
      ) : null}
    </>
  );
}
