import { useState } from "react";
import {
  UserRound,
  Globe2,
  Palette,
  Save,
  RotateCcw,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { useApp, defaults } from "../context/appState";
import { PageHeading, PanelTitle } from "../components/UI";
import { regions } from "../utils/format";
export default function Settings() {
  const {
    preferences,
    savePreferences,
    countries,
    theme,
    setTheme,
    loading,
    error,
  } = useApp();
  const [form, setForm] = useState({ ...preferences });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setMessage("");
  }
  function submit(e) {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your profile name.";
    else if (form.name.trim().length < 3 || form.name.trim().length > 30)
      next.name = "Your name must contain 3–30 characters.";
    if (!regions.includes(form.region))
      next.region = "Please choose a preferred region.";
    if (!form.country) next.country = "Please choose a preferred country.";
    else if (!countries.some((c) => c.cca3 === form.country))
      next.country = "Please choose a country from the available list.";
    if (!["name", "population", "area"].includes(form.sort))
      next.sort = "Please choose a sort order.";
    setErrors(next);
    if (!Object.keys(next).length) {
      if (savePreferences({ ...form, name: form.name.trim() }))
        setMessage("Preferences saved. Your world, your way.");
      else
        setMessage(
          "Your browser could not save preferences. Please allow local storage and try again.",
        );
    }
  }
  function reset() {
    if (savePreferences(defaults)) {
      setForm({ ...defaults });
      setErrors({});
      setMessage("Preferences reset to defaults.");
      setConfirm(false);
    } else {
      setConfirm(false);
      setMessage("Unable to reset: browser storage is unavailable.");
    }
  }
  const fieldError = (key) =>
    errors[key] && (
      <small className="field-error" id={`${key}-error`}>
        {errors[key]}
      </small>
    );
  return (
    <>
      <PageHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title="Your world, your way."
        description="A few preferences to make every exploration feel a little more personal."
      />
      <div className="settings-layout">
        <form onSubmit={submit} noValidate>
          <section className="panel settings-panel">
            <PanelTitle
              title="Profile & preferences"
              subtitle="These details stay on this browser. No account required."
            />
            <div className="form-section-label">
              <UserRound size={17} /> YOUR PROFILE
            </div>
            <div className="form-field">
              <label htmlFor="profile-name">
                Profile name <span>*</span>
              </label>
              <input
                id="profile-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="What should we call you?"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : "name-help"}
              />
              <small id="name-help">Between 3 and 30 characters.</small>
              {fieldError("name")}
            </div>
            <div className="form-section-label">
              <Globe2 size={17} /> EXPLORATION DEFAULTS
            </div>
            {error && (
              <div className="inline-alert">
                Country data is unavailable. Return to Dashboard to retry before
                saving.
              </div>
            )}
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="preferred-region">
                  Preferred region <span>*</span>
                </label>
                <select
                  id="preferred-region"
                  value={form.region}
                  onChange={(e) => update("region", e.target.value)}
                  aria-invalid={!!errors.region}
                  aria-describedby={errors.region ? "region-error" : undefined}
                >
                  <option value="">Choose a region</option>
                  {regions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                {fieldError("region")}
              </div>
              <div className="form-field">
                <label htmlFor="preferred-country">
                  Preferred country <span>*</span>
                </label>
                <select
                  id="preferred-country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  disabled={loading || !!error}
                  aria-invalid={!!errors.country}
                  aria-describedby={
                    errors.country ? "country-error" : undefined
                  }
                >
                  <option value="">
                    {loading ? "Loading countries…" : "Choose a country"}
                  </option>
                  {countries.map((c) => (
                    <option key={c.cca3} value={c.cca3}>
                      {c.name.common}
                    </option>
                  ))}
                </select>
                {fieldError("country")}
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="default-sort">
                Default sort order <span>*</span>
              </label>
              <select
                id="default-sort"
                value={form.sort}
                onChange={(e) => update("sort", e.target.value)}
                aria-invalid={!!errors.sort}
                aria-describedby={errors.sort ? "sort-error" : undefined}
              >
                <option value="name">Name (A–Z)</option>
                <option value="population">Population (highest first)</option>
                <option value="area">Land area (largest first)</option>
              </select>
              {fieldError("sort")}
              <small>
                Applied automatically when you open Explore countries.
              </small>
            </div>
            {message && (
              <p role="status" className="save-message">
                <Check size={17} />
                {message}
              </p>
            )}
            <div className="form-actions">
              <button
                className="text-button reset-button"
                type="button"
                onClick={() => setConfirm(true)}
              >
                <RotateCcw size={15} /> Reset defaults
              </button>
              <button className="button primary" type="submit">
                <Save size={16} /> Save preferences
              </button>
            </div>
          </section>
        </form>
        <aside className="settings-aside">
          <section className="panel">
            <PanelTitle
              title="Appearance"
              subtitle="Set the mood for your exploration."
            />
            <div className="theme-options">
              <button
                className={theme === "light" ? "active" : ""}
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
              >
                <Sun size={22} />
                <span>Light</span>
                {theme === "light" && <Check size={14} />}
              </button>
              <button
                className={theme === "dark" ? "active" : ""}
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
              >
                <Moon size={22} />
                <span>Dark</span>
                {theme === "dark" && <Check size={14} />}
              </button>
            </div>
          </section>
          <div className="privacy-note">
            <Palette size={22} />
            <h3>A space that feels like you.</h3>
            <p>
              Your preferences are stored locally on this device. We never ask
              for an account or send your profile details to a server.
            </p>
          </div>
        </aside>
      </div>
      {confirm && (
        <div className="modal-backdrop">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            aria-describedby="reset-description"
            className="modal"
            onKeyDown={(e) => {
              if (e.key === "Escape") setConfirm(false);
              if (e.key === "Tab") {
                e.preventDefault();
                const buttons = e.currentTarget.querySelectorAll("button");
                (document.activeElement === buttons[0]
                  ? buttons[1]
                  : buttons[0]
                ).focus();
              }
            }}
          >
            <RotateCcw size={27} />
            <h2 id="reset-title">Start fresh?</h2>
            <p id="reset-description">
              This will clear your profile and restore the default exploration
              preferences.
            </p>
            <div className="form-actions">
              <button
                autoFocus
                className="button"
                onClick={() => setConfirm(false)}
              >
                Keep preferences
              </button>
              <button className="button primary" onClick={reset}>
                Reset preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
