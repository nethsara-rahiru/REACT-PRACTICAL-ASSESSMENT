import { useEffect, useState } from "react";
import { getIndicators } from "../services/api";
export function useIndicators(codes) {
  const codesKey = codes.join(",");
  const [state, setState] = useState({ key: "", data: {}, loading: true });
  const [attempt, setAttempt] = useState(0);
  const key = `${codesKey}:${attempt}`;
  useEffect(() => {
    const controller = new AbortController();
    if (!codesKey) return () => controller.abort();
    Promise.all(
      codesKey
        .split(",")
        .map(async (code) => [
          code,
          await getIndicators(code, controller.signal),
        ]),
    )
      .then((rows) => {
        if (!controller.signal.aborted)
          setState({ key, data: Object.fromEntries(rows), loading: false });
      })
      .catch((e) => {
        if (e.name !== "AbortError" && !controller.signal.aborted)
          setState({
            key,
            data: {},
            loading: false,
            error: "Development indicators could not be loaded.",
          });
      });
    return () => controller.abort();
  }, [key, codesKey]);
  return {
    ...(state.key === key ? state : { data: {}, loading: !!codesKey }),
    retry: () => setAttempt((a) => a + 1),
  };
}
