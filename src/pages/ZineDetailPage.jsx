import { Link, useParams } from "react-router-dom";
import ZineViewer from "../components/ZineViewer";
import ZineImage from "../components/ZineImage";
import { useCart } from "../lib/cart-context";
import { formatPrice } from "../lib/format";

export default function ZineDetailPage({ zines }) {
  const { id } = useParams();
  const { addItem, hasItem } = useCart();
  const zine = zines.find((item) => item.id === id);
  const saved = zine ? hasItem(zine.id) : false;

  if (!zine) {
    return (
      <main className="detail-page-shell">
        <div className="detail-layout">
          <p>Could not find zine #{id}.</p>
          <Link className="ghost-link" to="/dig">
            Back to DIG
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="detail-page-shell">
      <div className="detail-topbar">
        <Link className="ghost-link" to="/dig">
          Back to DIG
        </Link>
        <Link className="ghost-link" to="/cart">
          Cart
        </Link>
      </div>

      <div className="detail-layout">
        <div className="detail-meta">
          <ZineImage className="detail-cover" src={zine.cover} alt={zine.title} />
          <div className="detail-copy">
            <p className="detail-id">ZINE {zine.id}</p>
            <h1>{zine.title}</h1>
            <p>{zine.description}</p>
            <p className="detail-availability">{zine.available === false ? "Unavailable" : "Available"}</p>
            <p className="detail-price">{formatPrice(zine.price)}</p>
            <div className="detail-actions">
              <button
                type="button"
                id="addCartBtn"
                onClick={() => addItem(zine.id)}
                disabled={zine.available === false || saved}
              >
                {saved ? "Saved in Cart" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        <ZineViewer zine={zine} />
      </div>
    </main>
  );
}
