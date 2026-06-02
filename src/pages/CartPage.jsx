import { useState } from "react";
import ProductDetailPanel from "../components/ProductDetailPanel";
import { Eyebrow, FieldLabel, GhostButton, GhostButtonUnderline, GhostLink, Panel, PrimaryButton, cx } from "../components/ui";
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
      setSubmitMessage(t("cart.successCheckEmail"));
      setFormState({
        name: "",
        note: "",
        email: "",
        phone: "",
        address: "",
        extraContact: ""
      });
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

  const requestForm = (
    <Panel as="form" className="grid gap-[18px] md:pl-4 text-base" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2">
        <FieldLabel>
          <span>{t("cart.fields.name")}</span>
          <input
            className="w-full focus:outline-none border-b border-dotted"
            name="name"
            value={formState.name}
            onChange={updateField}
            required
            spellCheck={false}
          />
        </FieldLabel>
        <FieldLabel>
          <span>{t("cart.fields.email")}</span>
          <input
            className="w-full focus:outline-none border-b border-dotted"
            name="email"
            type="email"
            value={formState.email}
            onChange={updateField}
            required
            spellCheck={false}
          />
        </FieldLabel>
        <FieldLabel>
          <span>{t("cart.fields.phone")}</span>
          <input
            className="w-full focus:outline-none border-b border-dotted"
            name="phone"
            value={formState.phone}
            onChange={updateField}
            required
            spellCheck={false}
          />
        </FieldLabel>
        <FieldLabel className="md:col-span-2">
          <span>{t("cart.fields.address")}</span>
          <textarea
            className="min-h-[110px] w-full resize-y focus:outline-none border-b border-dotted"
            name="address"
            value={formState.address}
            onChange={updateField}
            required
          />
        </FieldLabel>
        <FieldLabel className="md:col-span-2">
          <span>{t("cart.fields.extraContact")}</span>
          <input
            className="w-full focus:outline-none border-b border-dotted"
            name="extraContact"
            value={formState.extraContact}
            onChange={updateField}
            placeholder={t("cart.fields.extraContactPlaceholder")}
            spellCheck={false}
          />
        </FieldLabel>
      </div>

      <div className="flex gap-2 items-center w-full">
        <GhostButton onClick={() => setFormOpen(false)} className="flex-1 shrink-0">
          {t("common.close")}
        </GhostButton>
        <PrimaryButton type="submit" disabled={submitState === "submitting"} className="flex-1 shrink-0">
          {submitState === "submitting" ? t("cart.submitting") : t("cart.submit")}
        </PrimaryButton>
      </div>
      {submitMessage ? (
        <p
          className={cx(
            "text-sm font-bold",
            submitState === "success" && "text-green-800",
            submitState === "error" && "text-red-700"
          )}
        >
          {submitMessage}
        </p>
      ) : null}
    </Panel>
  );

  return (
    <main className="flex h-screen flex-col overflow-hidden p-4 pt-18 md:p-3 md:pt-22">
      <div className="shrink-0 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col items-start">
          {detailedItems.length > 0 ? (
            <GhostButtonUnderline onClick={clearCart}>
              {t("cart.clearCart")}
            </GhostButtonUnderline>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex min-h-0 w-full flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex min-h-0 w-full flex-col lg:w-2/3">
          {detailedItems.length === 0 ? (
            <Panel as="section" className="grid gap-4 p-7">
              <p className="text-xl w-full flex justify-center">{t("cart.empty")}</p>
            </Panel>
          ) : (
            <>
              <section className="grid flex-1 min-h-0 content-start grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-4 gap-y-7 overflow-y-auto pr-1 md:grid-cols-1">
                {detailedItems.map((item) => (
                  <ProductDetailPanel
                    key={`${item.type}-${item.id}`}
                    item={{
                      ...item.product,
                      type: item.type,
                      title: getLocalized(item.product.title),
                      description: getLocalized(item.product.description)
                    }}
                    subtitle={
                      getLocalized(item.product.author) ||
                      getLocalized(item.product.brand) ||
                      t("common.unknownMaker")
                    }
                    detailPath={item.detailPath}
                    language={language}
                    availabilityLabel={
                      item.product.available === false ? t("detail.unavailable") : t("detail.available")
                    }
                    headerAction={
                      <PrimaryButton className="justify-end text-right" onClick={() => removeItem(item.id, item.type)}>
                        {t("common.remove")}
                      </PrimaryButton>
                    }
                  />
                ))}
              </section>

              <Panel as="section" className="mt-4 shrink-0 flex flex-col gap-4 pb-7 text-base lg:flex-row lg:items-baseline lg:justify-between">
                <div className="flex gap-4">
                  <p>{t("common.total")}</p>
                  <strong className="font-normal">{formatPrice(totalPrice, language)}</strong>
                </div>
                <PrimaryButton onClick={() => setFormOpen((current) => !current)}>
                  {t("cart.request")}
                </PrimaryButton>
              </Panel>
            </>
          )}
        </div>

        {formOpen ? (
          <>
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setFormOpen(false)} />
            <section className="fixed inset-x-4 top-18 bottom-4 z-50 overflow-y-auto bg-white lg:hidden">
              {requestForm}
            </section>
            <section className="hidden w-full lg:flex-1 lg:border-l lg:border-dotted lg:block">
              {requestForm}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
