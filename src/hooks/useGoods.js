import { useEffect, useState } from "react";
import { DEFAULT_PRODUCT_IMAGE } from "../lib/product-display";

function buildGoodsAssets(good, manifest) {
  const pages = manifest[String(good.id)] ?? [];
  const fallbackCover = good.cover || DEFAULT_PRODUCT_IMAGE;
  const cover = pages[0] ?? fallbackCover;

  return {
    cover,
    pages: pages.length ? pages : [cover],
    hasDisplayImage: pages.length > 0 || fallbackCover !== DEFAULT_PRODUCT_IMAGE
  };
}

function hydrateGood(good, manifest) {
  return {
    ...good,
    ...buildGoodsAssets(good, manifest)
  };
}

export function useGoods() {
  const [goods, setGoods] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadGoods() {
      try {
        setStatus("loading");

        const [goodsResponse, manifestResponse] = await Promise.all([
          fetch("/goods.json"),
          fetch("/images/goods/manifest.json")
        ]);

        if (!goodsResponse.ok) {
          throw new Error(`HTTP ${goodsResponse.status}`);
        }

        if (!manifestResponse.ok) {
          throw new Error(`HTTP ${manifestResponse.status}`);
        }

        const [goodsData, manifestData] = await Promise.all([
          goodsResponse.json(),
          manifestResponse.json()
        ]);

        if (!ignore) {
          setGoods(
            Array.isArray(goodsData) ? goodsData.map((good) => hydrateGood(good, manifestData)) : []
          );
          setStatus("ready");
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : "Unknown error");
          setStatus("error");
        }
      }
    }

    loadGoods();

    return () => {
      ignore = true;
    };
  }, []);

  return { goods, status, error };
}
