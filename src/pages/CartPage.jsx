import { useState } from "react";
import { Link } from "react-router-dom";
import ZineImage from "../components/ZineImage";
import { Eyebrow, FieldLabel, GhostButton, GhostLink, Panel, PrimaryButton, cx } from "../components/ui";
import { useCart } from "../lib/cart-context";
import { formatPrice } from "../lib/format";
import { submitPurchaseRequest } from "../lib/purchase-requests";

export default function CartPage({ zines }) {
  const { items, removeItem, clearCart } = useCart();
  const [formOpen, setFormOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    note: "",
    email: "",
    phone: "",
    address: "",
    extraContact: ""
  });
  const [submitState, setSubmitState] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const detailedItems = items
    .map((item) => {
      const zine = zines.find((entry) => entry.id === item.id);
      if (!zine) {
        return null;
      }

      return {
        ...item,
        zine
      };
    })
    .filter(Boolean);

  const totalPrice = detailedItems.reduce((sum, item) => sum + item.zine.price, 0);

  function updateField(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (detailedItems.length === 0) {
      return;
    }

    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      await submitPurchaseRequest(formState, detailedItems);
      setSubmitState("success");
      setSubmitMessage("Purchase request submitted.");
      setFormState({
        name: "",
        note: "",
        email: "",
        phone: "",
        address: "",
        extraContact: ""
      });
      setFormOpen(false);
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : "Could not submit request.");
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Local Cart</Eyebrow>
          <h1 className="mt-1.5 text-5xl leading-[0.92] font-black">Cart</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <GhostLink to="/dig">
            Continue Browsing
          </GhostLink>
          {detailedItems.length > 0 ? (
            <GhostButton onClick={clearCart}>
              Clear Cart
            </GhostButton>
          ) : null}
        </div>
      </div>

      {detailedItems.length === 0 ? (
        <Panel as="section" className="grid gap-4 p-6">
          <p>Your cart is empty.</p>
          <GhostLink className="w-fit" to="/dig">
            Go to DIG
          </GhostLink>
        </Panel>
      ) : (
        <>
          <section className="grid gap-4">
            {detailedItems.map((item) => (
              <Panel
                key={item.id}
                as="article"
                className="grid items-start gap-[18px] p-[18px] md:grid-cols-[120px_minmax(0,1fr)_auto]"
              >
                <Link to={`/page/${item.zine.id}`} className="block overflow-hidden border border-neutral-950">
                  <ZineImage className="aspect-[3/4] w-full object-cover" src={item.zine.cover} alt={item.zine.title} />
                </Link>
                <div>
                  <Link
                    to={`/page/${item.zine.id}`}
                    className="mb-2 inline-block text-2xl font-black no-underline"
                  >
                    {item.zine.title}
                  </Link>
                  <p className="leading-[1.45]">{item.zine.description}</p>
                  <p className="mt-3 font-black">{formatPrice(item.zine.price)}</p>
                </div>
                <div className="grid justify-items-start gap-3 md:justify-items-end">
                  <GhostButton onClick={() => removeItem(item.id)}>
                    Remove
                  </GhostButton>
                </div>
              </Panel>
            ))}
          </section>

          <Panel as="section" className="mt-5 flex flex-col gap-4 p-6 lg:flex-row lg:items-baseline lg:justify-between">
            <div>
              <p>Total</p>
              <strong className="text-3xl font-black">{formatPrice(totalPrice)}</strong>
              <p className="text-neutral-600">Cart holds each zine once, like a request list or favorites list.</p>
            </div>
            <PrimaryButton onClick={() => setFormOpen((current) => !current)}>
              Request for Purchase
            </PrimaryButton>
          </Panel>

          {submitMessage ? (
            <p
              className={cx(
                "mt-3.5 text-sm font-bold",
                submitState === "success" && "text-green-800",
                submitState === "error" && "text-red-700"
              )}
            >
              {submitMessage}
            </p>
          ) : null}

          {formOpen ? (
            <section className="mt-5">
              <Panel as="form" className="grid gap-[18px] p-6" onSubmit={onSubmit}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Eyebrow>Purchase Request</Eyebrow>
                    <h2 className="mt-1.5 text-[32px] leading-[0.96] font-black">Request for Purchase</h2>
                  </div>
                  <GhostButton onClick={() => setFormOpen(false)}>
                    Close
                  </GhostButton>
                </div>

                <div className="grid gap-3.5 md:grid-cols-2">
                  <FieldLabel>
                    <span>Name</span>
                    <input
                      className="w-full border border-neutral-950 bg-white p-3"
                      name="name"
                      value={formState.name}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <span>One-line Note</span>
                    <input
                      className="w-full border border-neutral-950 bg-white p-3"
                      name="note"
                      value={formState.note}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <span>Email</span>
                    <input
                      className="w-full border border-neutral-950 bg-white p-3"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <span>Phone</span>
                    <input
                      className="w-full border border-neutral-950 bg-white p-3"
                      name="phone"
                      value={formState.phone}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel className="md:col-span-2">
                    <span>Address</span>
                    <textarea
                      className="min-h-[110px] w-full resize-y border border-neutral-950 bg-white p-3"
                      name="address"
                      value={formState.address}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel className="md:col-span-2">
                    <span>Extra Contact</span>
                    <input
                      className="w-full border border-neutral-950 bg-white p-3"
                      name="extraContact"
                      value={formState.extraContact}
                      onChange={updateField}
                      placeholder="Instagram ID, KakaoTalk ID, etc."
                    />
                  </FieldLabel>
                </div>

                <div className="border border-neutral-950 bg-white p-4">
                  <Eyebrow>Requested Zines</Eyebrow>
                  <ul className="mt-2.5 grid list-disc gap-1.5 pl-[18px]">
                    {detailedItems.map((item) => (
                      <li key={item.id}>
                        {item.zine.title} · {formatPrice(item.zine.price)}
                      </li>
                    ))}
                  </ul>
                </div>

                <PrimaryButton type="submit" disabled={submitState === "submitting"}>
                  {submitState === "submitting" ? "Submitting..." : "Submit Request"}
                </PrimaryButton>
              </Panel>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
