import { useEffect, useState } from "react";

/** useState that remembers its value in this browser until the user changes it. */
export function usePersistentState<T>(key: string, initial: T) {
  const storageKey = `fliq:pref:${key}`;
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [storageKey]);
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [storageKey, value, loaded]);
  return [value, setValue] as const;
}
