import { getLocalizedValue } from "./i18n";

export const SHIPPING_FEE = 3000;

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
      title: getLocalizedValue(item.product.title, language),
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
