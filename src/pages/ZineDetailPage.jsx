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
      <main className="min-h-screen mt-6 bg-stone-100 p-7">
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
    <main className="min-h-screen pt-14 p-7">
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <GhostLink to="/dig">
          Back to DIG
        </GhostLink>
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Panel className="grid gap-5 p-6 md:grid-cols-[160px_minmax(0,1fr)] text-sm">
          <ZineImage
            className="aspect-square w-full object-contain"
            src={zine.cover}
            alt={zine.title}
          />
          <div className="flex flex-col gap-[1.6em]">
            <h1 className="font-bold">{zine.title}</h1>
            <h1 className="">{zine.author ?? 'unknown author'}</h1>
            <p className="max-w-[42ch]">{zine.description}</p>
            <div className="flex flex-col">
              {zine.metadata &&
                zine.metadata.map((m, i) => 
                  <span key={i}>
                    {m}
                  </span>
                )
              }
            </div>
            <p>{zine.available === false ? "Unavailable" : "Available"}</p>
            <p>{formatPrice(zine.price)}</p>
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
