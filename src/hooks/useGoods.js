import { useEffect, useState } from "react";

export function useGoods() {
  const [goods, setGoods] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadGoods() {
      try {
        setStatus("loading");

        const response = await fetch("/goods.json");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!ignore) {
          setGoods(Array.isArray(data) ? data : []);
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
