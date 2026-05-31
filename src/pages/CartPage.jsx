import { useState } from "react";
import { Link } from "react-router-dom";
import ZineImage from "../components/ZineImage";
import { Eyebrow, FieldLabel, GhostButton, GhostLink, Panel, PrimaryButton, cx } from "../components/ui";
import { useCart } from "../lib/cart-context";
import { formatPrice } from "../lib/format";
import { useI18n } from "../lib/i18n";
import { submitPurchaseRequest } from "../lib/purchase-requests";

export default function CartPage({ zines, goods }) {
  const { items, removeItem, clearCart } = useCart();
  const { t, getLocalized, language } = useI18n();
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
      const product =
        item.type === "good"
          ? goods.find((entry) => entry.id === item.id)
          : zines.find((entry) => entry.id === item.id);

      if (!product) {
        return null;
      }

      return {
        ...item,
        product,
        detailPath: item.type === "good" ? `/goods/${item.id}` : `/page/${item.id}`
      };
    })
    .filter(Boolean);

  const totalPrice = detailedItems.reduce((sum, item) => sum + item.product.price, 0);

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
      await submitPurchaseRequest(formState, detailedItems, language);
      setSubmitState("success");
      setSubmitMessage(t("cart.success"));
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
      if (error instanceof Error && error.message === "purchase_request_endpoint_missing") {
        setSubmitMessage(t("cart.endpointMissing"));
        return;
      }
      if (error instanceof Error && error.message === "purchase_request_dispatch_failed") {
        setSubmitMessage(t("cart.requestDispatchFailed"));
        return;
      }
      setSubmitMessage(error instanceof Error ? error.message : t("cart.submitError"));
    }
  }

  return (
    <main className="min-h-screen p-7 pt-14">
      <div className="my-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col items-start">
          <GhostLink to="/dig">
            {t("cart.continueBrowsing")}
          </GhostLink>
          {detailedItems.length > 0 ? (
            <GhostButton onClick={clearCart}>
              {t("cart.clearCart")}
            </GhostButton>
          ) : null}
        </div>
      </div>

      {detailedItems.length === 0 ? (
        <Panel as="section" className="grid gap-4 p-6 text-sm">
          <p>{t("cart.empty")}</p>
          <GhostLink className="w-fit" to="/dig">
            {t("cart.goToDig")}
          </GhostLink>
        </Panel>
      ) : (
        <>
          <section className="grid gap-4">
            {detailedItems.map((item) => (
              <Panel
                key={`${item.type}-${item.id}`}
                as="article"
                className="grid items-start gap-5 p-6 text-sm md:grid-cols-[160px_minmax(0,1fr)_auto]"
              >
                <Link to={item.detailPath} className="block overflow-hidden -neutral-950">
                  <ZineImage
                    className="aspect-square w-full object-contain"
                    src={item.product.cover}
                    alt={getLocalized(item.product.title)}
                  />
                </Link>
                <div className="flex flex-col gap-[1.4em]">
                  <Link to={item.detailPath} className="inline-block underline underline-offset-2 hover:opacity-50">
                    {getLocalized(item.product.title)}
                  </Link>
                  <p>
                    {getLocalized(item.product.author) ||
                      getLocalized(item.product.brand) ||
                      t("common.unknownMaker")}
                  </p>
                  <p className="leading-[1.45] max-w-[42ch] break-keep">{getLocalized(item.product.description)}</p>
                  <p>{formatPrice(item.product.price, language)}</p>
                </div>
                <div className="grid justify-items-start gap-3 md:justify-items-end">
                  <GhostButton onClick={() => removeItem(item.id, item.type)}>
                    {t("common.remove")}
                  </GhostButton>
                </div>
              </Panel>
            ))}
          </section>

          <Panel as="section" className="mt-5 flex flex-col gap-4 p-6 text-sm lg:flex-row lg:items-baseline lg:justify-between">
            <div className="grid gap-[1.4em]">
              <p>{t("common.total")}</p>
              <strong className="font-normal">{formatPrice(totalPrice, language)}</strong>
              <p className="text-neutral-600">{t("cart.helper")}</p>
            </div>
            <PrimaryButton onClick={() => setFormOpen((current) => !current)}>
              {t("cart.request")}
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
              <Panel as="form" className="grid gap-[18px] p-6 text-sm" onSubmit={onSubmit}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="grid gap-1.5">
                    <Eyebrow>{t("cart.request")}</Eyebrow>
                    <h2>{t("cart.requestTitle")}</h2>
                  </div>
                  <GhostButton onClick={() => setFormOpen(false)}>
                    {t("common.close")}
                  </GhostButton>
                </div>

                <div className="grid gap-3.5 md:grid-cols-2">
                  <FieldLabel>
                    <span>{t("cart.fields.name")}</span>
                    <input
                      className="w-full bg-stone-50 p-3 text-sm"
                      name="name"
                      value={formState.name}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <span>{t("cart.fields.note")}</span>
                    <input
                      className="w-full bg-stone-50 p-3 text-sm"
                      name="note"
                      value={formState.note}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <span>{t("cart.fields.email")}</span>
                    <input
                      className="w-full bg-stone-50 p-3 text-sm"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <span>{t("cart.fields.phone")}</span>
                    <input
                      className="w-full bg-stone-50 p-3 text-sm"
                      name="phone"
                      value={formState.phone}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel className="md:col-span-2">
                    <span>{t("cart.fields.address")}</span>
                    <textarea
                      className="min-h-[110px] w-full resize-y bg-stone-50 p-3 text-sm"
                      name="address"
                      value={formState.address}
                      onChange={updateField}
                      required
                    />
                  </FieldLabel>
                  <FieldLabel className="md:col-span-2">
                    <span>{t("cart.fields.extraContact")}</span>
                    <input
                      className="w-full bg-stone-50 p-3 text-sm"
                      name="extraContact"
                      value={formState.extraContact}
                      onChange={updateField}
                      placeholder={t("cart.fields.extraContactPlaceholder")}
                    />
                  </FieldLabel>
                </div>

                <div className="bg-stone-50 p-4">
                  <Eyebrow>{t("cart.requestedItems")}</Eyebrow>
                  <ul className="mt-2.5 grid list-disc gap-1.5 pl-[18px]">
                    {detailedItems.map((item) => (
                      <li key={`${item.type}-${item.id}`}>
                        {getLocalized(item.product.title)} · {formatPrice(item.product.price, language)}
                      </li>
                    ))}
                  </ul>
                </div>

                <PrimaryButton type="submit" disabled={submitState === "submitting"}>
                  {submitState === "submitting" ? t("cart.submitting") : t("cart.submit")}
                </PrimaryButton>
              </Panel>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
