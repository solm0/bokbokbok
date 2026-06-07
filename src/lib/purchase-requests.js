import { getLocalizedValue } from "./i18n";
import { formatSelectedOptionsSuffix } from "./product-options";

export const SHIPPING_FEE = 3000;

function formatItemTitle(item, language) {
  const baseTitle = getLocalizedValue(item.product.title, language);
  const optionSuffix = formatSelectedOptionsSuffix(item.product, item.selectedOptions);
  return optionSuffix ? `${baseTitle} ${optionSuffix}` : baseTitle;
}

export async function submitPurchaseRequest(form, items, language = "ko") {
  const endpoint = import.meta.env.VITE_PURCHASE_REQUEST_ENDPOINT;

  if (!endpoint) {
    throw new Error("purchase_request_endpoint_missing");
  }

  const payload = {
    shippingFee: items.length > 0 ? SHIPPING_FEE : 0,
    totalPrice: items.reduce((sum, item) => sum + item.product.price, 0) + (items.length > 0 ? SHIPPING_FEE : 0),
    customer: {
      name: form.name.trim(),
      note: form.note.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      extraContact: form.extraContact.trim()
    },
    items: items.map((item) => ({
      id: item.product.id,
      type: item.type,
      selectedOptions: item.selectedOptions ?? {},
      title: formatItemTitle(item, language),
      description: getLocalizedValue(item.product.description, language),
      price: item.product.price
    })),
    createdAt: new Date().toISOString()
  };

  const response = await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  // Apps Script web apps typically do not expose CORS headers.
  // In no-cors mode the browser returns an opaque response that cannot
  // be inspected, so reaching this point means the request was dispatched.
  if (!response) {
    throw new Error("purchase_request_dispatch_failed");
  }
}
