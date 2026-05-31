import { useParams } from "react-router-dom";
import ZineViewer from "../components/ZineViewer";
import ZineImage from "../components/ZineImage";
import { Eyebrow, GhostLink, Panel, PrimaryButton } from "../components/ui";
import { useCart } from "../lib/cart-context";
import { formatPrice } from "../lib/format";

export default function ZineDetailPage({ zines }) {
  const { id } = useParams();
  const { addItem, hasItem } = useCart();
  const zine = zines.find((item) => item.id === id);
  const saved = zine ? hasItem(zine.id) : false;

  if (!zine) {
    return (
      <main className="min-h-screen bg-stone-100 p-7">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <p>Could not find zine #{id}.</p>
          <GhostLink to="/dig">
            Back to DIG
          </GhostLink>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 p-7">
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <GhostLink to="/dig">
          Back to DIG
        </GhostLink>
        <GhostLink to="/cart">
          Cart
        </GhostLink>
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Panel className="grid gap-5 p-6 md:grid-cols-[160px_minmax(0,1fr)]">
          <ZineImage
            className="aspect-[3/4] w-full border border-neutral-950 object-cover"
            src={zine.cover}
            alt={zine.title}
          />
          <div>
            <Eyebrow>ZINE {zine.id}</Eyebrow>
            <h1 className="mt-1.5 mb-3.5 text-[40px] leading-[0.94] font-black">{zine.title}</h1>
            <p className="max-w-[42ch] leading-6">{zine.description}</p>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.04em]">
              {zine.available === false ? "Unavailable" : "Available"}
            </p>
            <p className="my-[18px] text-2xl font-black">{formatPrice(zine.price)}</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <PrimaryButton
                onClick={() => addItem(zine.id)}
                disabled={zine.available === false || saved}
              >
                {saved ? "Saved in Cart" : "Add to Cart"}
              </PrimaryButton>
            </div>
          </div>
        </Panel>

        <ZineViewer zine={zine} />
      </div>
    </main>
  );
}
