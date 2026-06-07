import { useState } from "react";
import ZineImage from "./ZineImage";
import { cx } from "./ui";

export default function ProductCardContent({
  title,
  subtitle,
  cover,
  mode = "grid",
  imageBackgroundClassName = "bg-neutral-900",
  imageClassName = ""
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
          className={cx(
            isGrid
              ? "h-full w-full p-3 max-h-full max-w-full object-contain"
              : 'max-h-full max-w-full object-contain',
            imageClassName
          )}
          src={cover}
          alt={title}
        />
      </span>
      {isGrid ? (
        <>
          <span className="mt-3 text-xs font-bold">{title}</span>
          {subtitle ? <span className="text-xs opacity-70 mt-2">{subtitle}</span> : null}
        </>
      ) : null}
    </>
  );
}
