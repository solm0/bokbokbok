import { useEffect, useState } from "react";
import { DEFAULT_PRODUCT_IMAGE } from "../lib/product-display";

function buildZineAssets(zine, manifest) {
  const pages = manifest[String(zine.id)] ?? [];
  const fallbackCover = zine.cover || DEFAULT_PRODUCT_IMAGE;
  const cover = pages[0] ?? fallbackCover;

  return {
    cover,
    pages: pages.length ? pages : [cover],
    hasDisplayImage: pages.length > 0 || fallbackCover !== DEFAULT_PRODUCT_IMAGE
  };
}

function hydrateZine(zine, manifest) {
  return {
    ...zine,
    ...buildZineAssets(zine, manifest)
  };
}

export function useZines() {
  const [zines, setZines] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadZines() {
      try {
        setStatus("loading");

        const [zinesResponse, manifestResponse] = await Promise.all([
          fetch("/zines.json"),
          fetch("/images/zines/manifest.json")
        ]);

        if (!zinesResponse.ok) {
          throw new Error(`HTTP ${zinesResponse.status}`);
        }

        if (!manifestResponse.ok) {
          throw new Error(`HTTP ${manifestResponse.status}`);
        }

        const [zinesData, manifestData] = await Promise.all([
          zinesResponse.json(),
          manifestResponse.json()
        ]);

        if (!ignore) {
          setZines(zinesData.map((zine) => hydrateZine(zine, manifestData)));
          setStatus("ready");
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : "Unknown error");
          setStatus("error");
        }
      }
    }

    loadZines();

    return () => {
      ignore = true;
    };
  }, []);

  return { zines, status, error };
}
