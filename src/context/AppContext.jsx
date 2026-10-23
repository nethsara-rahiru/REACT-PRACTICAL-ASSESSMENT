import { useEffect, useState, useCallback } from "react";
import { AppContext, defaults } from "./appState";
import { getCountries } from "../services/api";
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function AppProvider({ children }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [preferences, setPreferences] = useState(() => {
    const saved = read("worldscope-preferences", defaults);
    return saved && typeof saved === "object"
      ? { ...defaults, ...saved }
      : defaults;
  });
  const [theme, setTheme] = useState(() =>
    read("worldscope-theme", "light") === "dark" ? "dark" : "light",
  );
  const [selected, setSelected] = useState([]);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    getCountries(controller.signal)
      .then(setCountries)
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(e.message || "Unable to reach the country service.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    store("worldscope-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(id);
  }, [notice]);
  const toggleCountry = useCallback((code) => {
    setSelected((current) =>
      current.includes(code)
        ? current.filter((c) => c !== code)
        : current.length < 4
          ? [...current, code]
          : current,
    );
  }, []);
  function savePreferences(value) {
    if (!store("worldscope-preferences", value)) return false;
    setPreferences(value);
    return true;
  }
  return (
    <AppContext.Provider
      value={{
        countries,
        loading,
        error,
        retry: () => {
          setLoading(true);
          setError("");
          setAttempt((a) => a + 1);
        },
        preferences,
        savePreferences,
        theme,
        setTheme,
        selected,
        toggleCountry,
        notice,
        setNotice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
