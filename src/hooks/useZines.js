import { useEffect, useState } from "react";

function buildZineAssets(id, manifest) {
  const pages = manifest[String(id)] ?? [];
  const cover = pages[0] ?? `/images/zines/${id}_cover.png`;

  return {
    cover,
    pages: pages.length ? pages : [cover]
  };
}

function hydrateZine(zine, manifest) {
  return {
    ...zine,
    ...buildZineAssets(zine.id, manifest)
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
