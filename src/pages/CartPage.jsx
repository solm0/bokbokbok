import { useState } from "react";
import ProductDetailPanel from "../components/ProductDetailPanel";
import { Eyebrow, FieldLabel, GhostButton, GhostButtonUnderline, GhostLink, Panel, PrimaryButton, cx } from "../components/ui";
import { useCart } from "../lib/cart-context";
import { formatPrice } from "../lib/format";
import { useI18n } from "../lib/i18n";
import { getProductImageBackgroundClass } from "../lib/product-display";
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
  const formLabelClassName = "w-[7.5rem] shrink-0 md:w-[8.5rem]";
  const formFieldClassName = "min-w-0 flex-1 w-full focus:outline-none border-b border-dotted";

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

  const purchasableItems = detailedItems.filter((item) => item.product.available !== false);
  const totalPrice = purchasableItems.reduce((sum, item) => sum + item.product.price, 0);

  function updateField(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (purchasableItems.length === 0) {
      return;
    }

    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      await submitPurchaseRequest(formState, purchasableItems, language);
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
          <span className={`flex items-center gap-1 ${formLabelClassName}`}>
            {t("cart.fields.name")}
            <span>*</span>
          </span>
          <input
            className={formFieldClassName}
            name="name"
            value={formState.name}
            onChange={updateField}
            required
            spellCheck={false}
          />
        </FieldLabel>
        <FieldLabel>
          <span className={`flex items-center gap-1 ${formLabelClassName}`}>
            {t("cart.fields.email")}
            <span>*</span>
          </span>
          <input
            className={formFieldClassName}
            name="email"
            type="email"
            value={formState.email}
            onChange={updateField}
            required
            spellCheck={false}
          />
        </FieldLabel>
        <FieldLabel>
          <span className={`flex items-center gap-1 ${formLabelClassName}`}>
            {t("cart.fields.phone")}
            <span>*</span>
          </span>
          <input
            className={formFieldClassName}
            name="phone"
            value={formState.phone}
            onChange={updateField}
            required
            spellCheck={false}
          />
        </FieldLabel>
        <FieldLabel className="md:col-span-2">
          <span className={`flex items-center gap-1 ${formLabelClassName}`}>
            {t("cart.fields.address")}
            <span>*</span>
          </span>
          <textarea
            className={`${formFieldClassName} min-h-[110px] resize-y`}
            name="address"
            value={formState.address}
            onChange={updateField}
            required
          />
        </FieldLabel>
        <FieldLabel className="md:col-span-2">
          <span className={formLabelClassName}>{t("cart.fields.note")}</span>
          <textarea
            className={`${formFieldClassName} min-h-[88px] resize-y`}
            name="note"
            value={formState.note}
            onChange={updateField}
            placeholder="Leave a note!"
          />
        </FieldLabel>
        <FieldLabel className="md:col-span-2">
          <span className={formLabelClassName}>{t("cart.fields.extraContact")}</span>
          <textarea
            className={`${formFieldClassName} min-h-[88px] resize-y`}
            name="extraContact"
            value={formState.extraContact}
            onChange={updateField}
            placeholder={t("cart.fields.extraContactPlaceholder")}
            spellCheck={false}
          />
        </FieldLabel>
        <div className="mt-7 text-xs border border-dotted p-3 gap-3 flex flex-col break-keep text-center">
          <p className="text-sm">Please submit the form after making a payment to the account below.</p>
          <p>아래 계좌로 입금 후 폼 제출 부탁드립니다.</p>
          <p className="pt-[1.7em] font-sans">백채민 카카오뱅크 3333-37-6005790</p>
        </div>
      </div>

      <div className="flex gap-2 items-center w-full">
        <GhostButton onClick={() => setFormOpen(false)} className="flex-1 shrink-0">
          {t("common.close")}
        </GhostButton>
        <PrimaryButton
          type="submit"
          disabled={submitState === "submitting" || purchasableItems.length === 0}
          className="flex-1 shrink-0"
        >
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
      <div className="shrink-0 flex flex-wrap w-full md:w-2/3 justify-start gap-4">
        {detailedItems.length > 0 ? (
          <GhostButtonUnderline onClick={clearCart}>
            {t("cart.clearCart")}
          </GhostButtonUnderline>
        ) : null}
      </div>

      <div className="mt-4 flex min-h-0 w-full flex-1 flex-col gap-4 md:flex-row">
        <div className="flex min-h-0 w-full flex-col md:w-2/3">
          {detailedItems.length === 0 ? (
            <Panel as="section" className="grid justify-items-center gap-4 p-7">
              <p className="text-xl w-full flex justify-center">{t("cart.empty")}</p>
              <img src="/images/ilovezinemouse.png" alt="" className="w-28 max-w-full" />
            </Panel>
          ) : (
            <>
              <section className="grid min-h-0 flex-1 content-start grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-4 gap-y-7 overflow-y-auto pb-32 pr-1 md:grid-cols-1 md:pb-0">
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
                      item.type === "good"
                        ? getLocalized(item.product.brand) || ""
                        : getLocalized(item.product.author) || ""
                    }
                    detailPath={item.detailPath}
                    language={language}
                    imageBackgroundClassName={
                      item.type === "zine" && !item.product.hasDisplayImage
                        ? "bg-neutral-100"
                        : getProductImageBackgroundClass({
                            type: item.type,
                            invertBg: item.product.invertBg
                          })
                    }
                    availabilityLabel={
                      item.product.available === false ? t("detail.unavailable") : t("detail.available")
                    }
                    headerAction={
                      <PrimaryButton className="justify-end text-right" onClick={() => removeItem(item.id, item.type)}>
                        <span className="md:hidden">X</span>
                        <span className="hidden md:inline">{t("common.remove")}</span>
                      </PrimaryButton>
                    }
                    overlayClassName={item.product.available === false ? "bg-white/70" : ""}
                    short={true}
                  />
                ))}
              </section>

              <Panel
                as="section"
                className="fixed inset-x-4 bottom-4 z-30 flex shrink-0 flex-col gap-4 text-base md:static md:mt-4 md:flex-row md:items-baseline md:justify-between md:pb-7"
              >
                <div className="flex gap-4">
                  <p>{t("common.total")}</p>
                  <strong className="font-normal">{formatPrice(totalPrice, language)}</strong>
                </div>
                <PrimaryButton
                  onClick={() => setFormOpen((current) => !current)}
                  disabled={purchasableItems.length === 0}
                >
                  {t("cart.request")}
                </PrimaryButton>
              </Panel>
            </>
          )}
        </div>

        {formOpen ? (
          <>
            <div className="fixed inset-0 z-40 md:hidden" onClick={() => setFormOpen(false)} />
            <section className="fixed inset-x-4 top-18 bottom-4 z-50 overflow-y-auto bg-white md:hidden">
              {requestForm}
            </section>
            <section className="hidden w-full md:flex-1 md:border-l md:border-dotted md:block">
              {requestForm}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
