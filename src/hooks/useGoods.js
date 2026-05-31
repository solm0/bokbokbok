import { useEffect, useState } from "react";

function buildGoodsAssets(id, manifest) {
  const pages = manifest[String(id)] ?? [];
  const cover = pages[0] ?? `/images/goods/${id}_cover.png`;

  return {
    cover,
    pages: pages.length ? pages : [cover]
  };
}

function hydrateGood(good, manifest) {
  return {
    ...good,
    ...buildGoodsAssets(good.id, manifest)
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
