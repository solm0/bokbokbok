export function getProductImageBackgroundClass(productOrType) {
  const type = typeof productOrType === "string" ? productOrType : productOrType?.type;
  const invertBg =
    typeof productOrType === "string" ? false : Boolean(productOrType?.invertBg);
  const defaultClassName = type === "good" ? "bg-neutral-100" : "bg-neutral-900";

  if (!invertBg) {
    return defaultClassName;
  }

  return type === "good" ? "bg-neutral-900" : "bg-neutral-100";
}
