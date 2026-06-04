import { DEFAULT_PRODUCT_IMAGE } from "../lib/product-display";

const FALLBACK_SRC = DEFAULT_PRODUCT_IMAGE;

export default function ZineImage({ src, alt, className = "", onLoad }) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onLoad={onLoad}
      draggable="false"
      onDragStart={(event) => event.preventDefault()}
      onError={(event) => {
        if (event.currentTarget.src.endsWith(FALLBACK_SRC)) {
          return;
        }
        event.currentTarget.src = FALLBACK_SRC;
      }}
    />
  );
}
