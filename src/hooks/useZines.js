import { useEffect, useState } from "react";

function buildZineAssets(id, pageCount = 0) {
  const cover = `/images/zines/${id}_cover.png`;
  const pages = Array.from({ length: pageCount }, (_, index) => `/images/zines/${id}_page-${index + 1}.png`);

  return {
    cover,
    pages: [cover, ...pages]
  };
}

function hydrateZine(zine) {
  const pageCount = Number.isFinite(zine.pageCount) ? zine.pageCount : 0;

  return {
    ...zine,
    ...buildZineAssets(zine.id, pageCount)
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
        const response = await fetch("/zines.json");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (!ignore) {
          setZines(data.map(hydrateZine));
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
