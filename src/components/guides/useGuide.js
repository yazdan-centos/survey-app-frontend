import { useCallback, useEffect, useState } from "react";
import { guideApi } from "./guideApi";
import { useHttp } from '../../hooks/useHttp';

/** Loads a guide for edit mode. With no id it is idle (create mode). */
export function useGuide(guideId) {
  const http = useHttp();
  const [state, setState] = useState({ guide: null, loading: !!guideId, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!guideId) {
      setState({ guide: null, loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    setState({ guide: null, loading: true, error: null });
    guideApi
      .get(http, guideId, controller.signal)
      .then((guide) => {
        if (!controller.signal.aborted) setState({ guide, loading: false, error: null });
      })
      .catch((err) => {
        if (!controller.signal.aborted && err.name !== "AbortError") setState({ guide: null, loading: false, error: err });
      });
    return () => controller.abort();
  }, [guideId, attempt, http]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
