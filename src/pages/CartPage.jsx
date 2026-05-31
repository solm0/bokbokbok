import { useState } from "react";
import { Link } from "react-router-dom";
import ZineImage from "../components/ZineImage";
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
    <main className="cart-page">
      <div className="cart-head">
        <div>
          <p className="detail-id">Local Cart</p>
          <h1>Cart</h1>
        </div>
        <div className="cart-head-links">
          <Link className="ghost-link" to="/dig">
            Continue Browsing
          </Link>
          {detailedItems.length > 0 ? (
            <button type="button" className="ghost-link button-link" onClick={clearCart}>
              Clear Cart
            </button>
          ) : null}
        </div>
      </div>

      {detailedItems.length === 0 ? (
        <section className="cart-empty">
          <p>Your cart is empty.</p>
          <Link className="ghost-link" to="/dig">
            Go to DIG
          </Link>
        </section>
      ) : (
        <>
          <section className="cart-list">
            {detailedItems.map((item) => (
              <article key={item.id} className="cart-item">
                <Link to={`/page/${item.zine.id}`} className="cart-thumb">
                  <ZineImage src={item.zine.cover} alt={item.zine.title} />
                </Link>
                <div className="cart-copy">
                  <Link to={`/page/${item.zine.id}`} className="cart-title">
                    {item.zine.title}
                  </Link>
                  <p>{item.zine.description}</p>
                  <p className="cart-price">{formatPrice(item.zine.price)}</p>
                </div>
                <div className="cart-actions">
                  <button type="button" className="ghost-link button-link" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="cart-summary">
            <div>
              <p>Total</p>
              <strong>{formatPrice(totalPrice)}</strong>
              <p className="cart-note">Cart holds each zine once, like a request list or favorites list.</p>
            </div>
            <button type="button" className="request-btn" onClick={() => setFormOpen((current) => !current)}>
              Request for Purchase
            </button>
          </section>

          {submitMessage ? (
            <p className={`submit-message ${submitState}`}>{submitMessage}</p>
          ) : null}

          {formOpen ? (
            <section className="request-form-shell">
              <form className="request-form" onSubmit={onSubmit}>
                <div className="request-form-head">
                  <div>
                    <p className="detail-id">Purchase Request</p>
                    <h2>Request for Purchase</h2>
                  </div>
                  <button type="button" className="ghost-link button-link" onClick={() => setFormOpen(false)}>
                    Close
                  </button>
                </div>

                <div className="request-grid">
                  <label>
                    <span>Name</span>
                    <input name="name" value={formState.name} onChange={updateField} required />
                  </label>
                  <label>
                    <span>One-line Note</span>
                    <input name="note" value={formState.note} onChange={updateField} required />
                  </label>
                  <label>
                    <span>Email</span>
                    <input name="email" type="email" value={formState.email} onChange={updateField} required />
                  </label>
                  <label>
                    <span>Phone</span>
                    <input name="phone" value={formState.phone} onChange={updateField} required />
                  </label>
                  <label className="full">
                    <span>Address</span>
                    <textarea name="address" value={formState.address} onChange={updateField} required />
                  </label>
                  <label className="full">
                    <span>Extra Contact</span>
                    <input
                      name="extraContact"
                      value={formState.extraContact}
                      onChange={updateField}
                      placeholder="Instagram ID, KakaoTalk ID, etc."
                    />
                  </label>
                </div>

                <div className="request-preview">
                  <p className="detail-id">Requested Zines</p>
                  <ul>
                    {detailedItems.map((item) => (
                      <li key={item.id}>
                        {item.zine.title} · {formatPrice(item.zine.price)}
                      </li>
                    ))}
                  </ul>
                </div>

                <button type="submit" className="request-btn" disabled={submitState === "submitting"}>
                  {submitState === "submitting" ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
