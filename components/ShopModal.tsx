"use client";

import { useEffect, useMemo, useState } from "react";
import { shopifyGql } from "@/lib/shopifyClient";
import {
  Q_COLLECTIONS,
  Q_COLLECTION_BY_HANDLE,
  M_CART_CREATE,
  M_CART_LINES_ADD,
} from "@/lib/shopify";

type Props = {
  open: boolean;
  onClose: () => void;
  desiredCollectionTitles: string[];
  defaultCollectionTitle: string | null;
};

type Collection = { id: string; title: string; handle: string };
type Product = {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  featuredImage?: { url: string; altText?: string | null } | null;
  priceRange?: {
    minVariantPrice?: { amount: string; currencyCode: string };
  } | null;
  variants?: {
    nodes: Array<{ id: string; title: string; availableForSale: boolean }>;
  };
};

const CART_KEY = "opeshield_cart_id_v2";

export default function ShopModal({
  open,
  onClose,
  desiredCollectionTitles,
  defaultCollectionTitle,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionHandle, setCollectionHandle] = useState<string>("");
  const [collectionTitle, setCollectionTitle] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [cartSummary, setCartSummary] = useState<string>("Cart: 0 items");

  const desiredLower = useMemo(
    () => desiredCollectionTitles.map((t) => t.toLowerCase()),
    [desiredCollectionTitles]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(CART_KEY);
      if (stored) setCartId(stored);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        setLoading(true);
        await ensureCart();

        const data = await shopifyGql<any>(Q_COLLECTIONS, { first: 50 });
        const all: Collection[] = data?.collections?.nodes ?? [];

        const exact = all.filter((c) =>
          desiredLower.includes(c.title.toLowerCase())
        );
        const final = (exact.length ? exact : all).map((c) => ({
          id: c.id,
          title: c.title,
          handle: c.handle,
        }));

        setCollections(final);

        let handle = final[0]?.handle ?? "";
        let title = final[0]?.title ?? "";

        if (defaultCollectionTitle) {
          const match = final.find((c) => c.title === defaultCollectionTitle);
          if (match) {
            handle = match.handle;
            title = match.title;
          }
        }

        setCollectionHandle(handle);
        setCollectionTitle(title);

        if (handle) {
          await loadProducts(handle);
        }
      } catch (e: any) {
        console.error(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function ensureCart() {
    if (cartId) return cartId;

    const data = await shopifyGql<any>(M_CART_CREATE, { lines: [] });
    const cart = data?.cartCreate?.cart;
    const errs = data?.cartCreate?.userErrors ?? [];
    if (errs.length) throw new Error(errs.map((x: any) => x.message).join(" | "));

    const id = cart.id as string;
    setCartId(id);
    window.localStorage.setItem(CART_KEY, id);

    updateCartMeta(cart);
    return id;
  }

  function money(amount: string, currency: string) {
    const n = Number(amount);
    if (Number.isNaN(n)) return `${amount} ${currency}`;
    return `${n.toFixed(2)} ${currency}`;
  }

  function updateCartMeta(cart: any) {
    const qty = cart?.totalQuantity ?? 0;
    const total = cart?.cost?.totalAmount;
    setCheckoutUrl(cart?.checkoutUrl ?? null);

    if (total?.amount && total?.currencyCode) {
      setCartSummary(
        `Cart: ${qty} item(s) • Total: ${money(
          total.amount,
          total.currencyCode
        )}`
      );
    } else {
      setCartSummary(`Cart: ${qty} item(s)`);
    }
  }

  async function loadProducts(handle: string) {
    setLoading(true);
    try {
      const data = await shopifyGql<any>(Q_COLLECTION_BY_HANDLE, {
        handle,
        productsFirst: 24,
      });
      const col = data?.collection;
      const prods: Product[] = col?.products?.nodes ?? [];
      setProducts(prods);
      setCollectionTitle(col?.title ?? "");
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(variantId: string) {
    const id = await ensureCart();
    const data = await shopifyGql<any>(M_CART_LINES_ADD, {
      cartId: id,
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    });

    const errs = data?.cartLinesAdd?.userErrors ?? [];
    if (errs.length) {
      alert(errs.map((x: any) => x.message).join(" | "));
      return;
    }
    updateCartMeta(data?.cartLinesAdd?.cart);
  }

  function openCheckout() {
    if (!checkoutUrl) {
      alert("Add an item to the cart first.");
      return;
    }
    window.location.href = checkoutUrl;
    // Mobile app later (Capacitor): Browser.open({ url: checkoutUrl })
  }

  if (!open) return null;

  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.currentTarget === e.target && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal">
        <div className="head">
          <div>
            <h3>Shop</h3>
            <div className="muted">
              {collectionTitle
                ? `Collection: ${collectionTitle}`
                : "Powered by OPEShield (Shopify)"}
            </div>
          </div>

          <div className="controls">
            <select
              className="select"
              value={collectionHandle}
              onChange={(e) => {
                const handle = e.target.value;
                setCollectionHandle(handle);
                const t =
                  collections.find((c) => c.handle === handle)?.title ?? "";
                setCollectionTitle(t);
                loadProducts(handle);
              }}
            >
              {collections.map((c) => (
                <option key={c.id} value={c.handle}>
                  {c.title}
                </option>
              ))}
            </select>

            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="body">
          {loading ? (
            <div className="empty">Loading…</div>
          ) : products.length ? (
            <div className="grid">
              {products.map((p) => {
                const v = p.variants?.nodes?.[0];
                const price = p.priceRange?.minVariantPrice;
                const img = p.featuredImage?.url ?? "";
                const alt = p.featuredImage?.altText ?? p.title;

                const soldOut = !v?.availableForSale;

                return (
                  <div className="prod" key={p.id}>
                    <img className="img" src={img} alt={alt} />
                    <div>
                      <div className="ptitle">{p.title}</div>
                      <div className="pprice">
                        {price?.amount
                          ? money(price.amount, price.currencyCode)
                          : ""}
                      </div>
                    </div>
                    <button
                      className={`btn primary ${soldOut ? "disabled" : ""}`}
                      onClick={() => v?.id && addToCart(v.id)}
                      disabled={soldOut}
                    >
                      {soldOut ? "Sold Out" : "Add to Cart"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty">No products found in this collection.</div>
          )}
        </div>

        <div className="foot">
          <div className="cart">{cartSummary}</div>
          <button className="btn primary" onClick={openCheckout}>
            Checkout
          </button>
        </div>
      </div>

      <style>{shopCss}</style>
    </div>
  );
}

const shopCss = `
.overlay{
  position:fixed; inset:0;
  background: rgba(0,0,0,.58);
  backdrop-filter: blur(8px);
  display:flex; align-items:center; justify-content:center;
  padding: 18px;
  z-index: 1000;
}
.modal{
  width:100%; max-width: 980px;
  border-radius: 26px;
  background: rgba(20,24,40,.92);
  border: 1px solid rgba(255,255,255,.14);
  box-shadow: 0 18px 55px rgba(0,0,0,.45);
  overflow:hidden;
}
.head{
  display:flex; justify-content:space-between; gap:12px; align-items:center;
  padding: 14px 14px;
  background: rgba(0,0,0,.15);
  border-bottom: 1px solid rgba(255,255,255,.10);
  flex-wrap:wrap;
}
.head h3{margin:0;font-size:16px;letter-spacing:.2px}
.muted{opacity:.72;font-size:12px}
.controls{display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end; flex:1}
.select{
  min-width: 280px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color: #fff;
}
.body{padding: 14px}
.grid{display:grid; grid-template-columns: repeat(12, 1fr); gap: 12px}
.prod{
  grid-column: span 4;
  background: rgba(0,0,0,.16);
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 18px;
  padding: 12px;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.img{
  width:100%;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  object-fit: cover;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
}
.ptitle{font-size:13px; font-weight: 650}
.pprice{opacity:.78; font-size:12px; margin-top: 2px}
.btn{
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.07);
  color: rgba(255,255,255,.92);
  border-radius: 12px;
  padding: 10px 12px;
  cursor:pointer;
  transition: transform .18s ease, background .18s ease, border-color .18s ease;
}
.btn:hover{transform: translateY(-1px); background: rgba(255,255,255,.095); border-color: rgba(255,255,255,.22)}
.btn.primary{
  background: linear-gradient(135deg, rgba(124,58,237,.85), rgba(6,182,212,.72));
  border-color: rgba(255,255,255,.18);
}
.btn.disabled{opacity:.6; cursor:not-allowed}
.foot{
  display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;
  padding: 12px 14px;
  border-top: 1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.15);
}
.cart{opacity:.85; font-size:12px}
.empty{opacity:.78; padding: 10px}
@media(max-width:980px){ .prod{grid-column: span 6} }
@media(max-width:560px){ .prod{grid-column: span 12} .select{min-width:0; width:100%} }
`;
