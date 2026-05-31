export async function submitPurchaseRequest(form, items) {
  const endpoint = import.meta.env.VITE_PURCHASE_REQUEST_ENDPOINT;

  if (!endpoint) {
    throw new Error("Apps Script endpoint is not configured yet.");
  }

  const payload = {
    customer: {
      name: form.name.trim(),
      note: form.note.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      extraContact: form.extraContact.trim()
    },
    items: items.map((item) => ({
      id: item.zine.id,
      title: item.zine.title,
      description: item.zine.description,
      price: item.zine.price
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
    throw new Error("Request could not be sent.");
  }
}
