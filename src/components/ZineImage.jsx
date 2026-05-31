const FALLBACK_SRC = "/images/bok.png";

export default function ZineImage({ src, alt, className = "" }) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
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
