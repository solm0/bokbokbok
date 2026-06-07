export function getOptionsEntries(product) {
  if (!product?.options || typeof product.options !== "object") {
    return [];
  }

  return Object.entries(product.options).filter(
    ([, values]) => Array.isArray(values) && values.length > 0
  );
}

export function getVariants(product) {
  if (!Array.isArray(product?.variants)) {
    return [];
  }

  return product.variants.filter(
    (variant) => variant && typeof variant === "object" && variant.selectedOptions
  );
}

export function getDefaultSelectedOptions(product) {
  const firstAvailableVariant = getVariants(product).find(
    (variant) => variant.available !== false
  );

  if (firstAvailableVariant?.selectedOptions) {
    return resolveSelectedOptions(product, firstAvailableVariant.selectedOptions);
  }

  return Object.fromEntries(
    getOptionsEntries(product).map(([key, values]) => [key, values[0]])
  );
}

export function resolveSelectedOptions(product, candidate) {
  const entries = getOptionsEntries(product);

  return Object.fromEntries(
    entries.map(([key, values]) => {
      const nextValue = candidate?.[key];
      return [key, values.includes(nextValue) ? nextValue : values[0]];
    })
  );
}

export function normalizeStoredSelectedOptions(item) {
  if (item?.selectedOptions && typeof item.selectedOptions === "object") {
    return item.selectedOptions;
  }

  if (item?.option) {
    return { size: item.option };
  }

  return {};
}

export function serializeSelectedOptions(selectedOptions = {}) {
  return JSON.stringify(
    Object.keys(selectedOptions)
      .sort()
      .reduce((result, key) => {
        result[key] = selectedOptions[key];
        return result;
      }, {})
  );
}

export function findVariant(product, selectedOptions) {
  const target = serializeSelectedOptions(resolveSelectedOptions(product, selectedOptions));
  return getVariants(product).find(
    (variant) => serializeSelectedOptions(variant.selectedOptions) === target
  );
}

export function isVariantAvailable(product, selectedOptions) {
  const variants = getVariants(product);

  if (!variants.length) {
    return product?.available !== false;
  }

  const variant = findVariant(product, selectedOptions);
  return variant ? variant.available !== false : false;
}

export function hasAnyAvailableVariant(product) {
  const variants = getVariants(product);

  if (!variants.length) {
    return product?.available !== false;
  }

  return variants.some((variant) => variant.available !== false);
}

export function isOptionValueAvailable(product, selectedOptions, groupKey, optionValue) {
  const nextSelectedOptions = resolveSelectedOptions(product, {
    ...selectedOptions,
    [groupKey]: optionValue
  });

  return isVariantAvailable(product, nextSelectedOptions);
}

export function formatOptionValue(optionValue) {
  return String(optionValue).toUpperCase();
}

export function formatSelectedOptionsSuffix(product, selectedOptions) {
  const entries = getOptionsEntries(product);
  const values = entries
    .map(([key]) => selectedOptions?.[key])
    .filter(Boolean)
    .map(formatOptionValue);

  return values.join(" ");
}
