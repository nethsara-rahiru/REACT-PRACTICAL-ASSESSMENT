import { Link } from "react-router-dom";
import { ArrowLeftRight, Plus, X, Info } from "lucide-react";
import { useApp } from "../context/appState";
import { PageHeading, DataState, Flag, PanelTitle } from "../components/UI";
import { useIndicators } from "../components/Indicators";
import { compact, money } from "../utils/format";
const metrics = [
  { key: "population", label: "Population", format: compact },
  { key: "area", label: "Land area (km²)", format: compact },
  { key: "gdp", label: "GDP (USD)", format: money, indicator: true },
  {
    key: "gdpPerCapita",
    label: "GDP per capita (USD)",
    format: money,
    indicator: true,
  },
  {
    key: "lifeExpectancy",
    label: "Life expectancy (years)",
    format: (v) => v.toFixed(1),
    indicator: true,
  },
];
const colors = ["#28856c", "#b692d0", "#e5ae5c", "#6d98c5"];
export default function Compare() {
  const { countries, selected, toggleCountry } = useApp();
  const picked = selected
    .map((code) => countries.find((c) => c.cca3 === code))
    .filter(Boolean);
  const { data, loading, retry } = useIndicators(picked.map((c) => c.cca3));
  function value(c, metric) {
    return metric.indicator
      ? data[c.cca3]?.values[metric.key]?.value
      : c[metric.key];
  }
  const failed = picked.some((c) => !data[c.cca3] || data[c.cca3].failed > 0);
  return (
    <>
      <PageHeading
        eyebrow="PERSPECTIVE THROUGH COMPARISON"
        title="See them side by side."
        description="Choose two to four countries. Discover their differences and shared stories."
      />
      <DataState>
        <section className="panel selection-panel">
          <PanelTitle
            title="Your comparison"
            subtitle={`${picked.length} of 4 countries selected`}
          />
          <div className="country-selections">
            {picked.map((c, i) => (
              <div
                className="selection-chip"
                key={c.cca3}
                style={{ "--country-color": colors[i] }}
              >
                <Flag country={c} />
                <Link to={`/country/${c.cca3}`}>{c.name.common}</Link>
                <button
                  className="icon-button"
                  onClick={() => toggleCountry(c.cca3)}
                  aria-label={`Remove ${c.name.common}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {picked.length < 4 && (
              <label className="add-country">
                <Plus size={18} />
                <span className="sr-only">Add country</span>
                <select
                  aria-label="Add a country to compare"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) toggleCountry(e.target.value);
                  }}
                >
                  <option value="">Add a country</option>
                  {countries
                    .filter((c) => !selected.includes(c.cca3))
                    .map((c) => (
                      <option key={c.cca3} value={c.cca3}>
                        {c.name.common}
                      </option>
                    ))}
                </select>
              </label>
            )}
          </div>
        </section>
        {picked.length < 2 ? (
          <div className="comparison-empty">
            <div className="empty-orbit">
              <ArrowLeftRight size={36} />
            </div>
            <h2>A little perspective goes a long way.</h2>
            <p>
              Select at least two countries above to compare population,
              <br /> economies, and quality of life.
            </p>
            <Link className="text-link" to="/explore">
              Or discover countries first ↗
            </Link>
          </div>
        ) : (
          <>
            {loading && (
              <p className="inline-status" role="status">
                Loading World Bank development indicators…
              </p>
            )}
            {!loading && failed && (
              <div className="inline-alert" role="alert">
                Some development indicators couldn’t be loaded. Country
                statistics are still available.{" "}
                <button onClick={retry} className="text-button">
                  Retry indicators
                </button>
              </div>
            )}
            <section className="panel comparison-table-panel">
              <PanelTitle
                title="The numbers that tell the story"
                subtitle="Latest available values · reporting years shown below each indicator"
              />
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Indicator</th>
                      {picked.map((c) => (
                        <th key={c.cca3} scope="col">
                          <Flag country={c} />
                          {c.name.common}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => {
                      const values = picked
                        .map((c) => value(c, metric))
                        .filter(Number.isFinite);
                      const max = Math.max(...values);
                      const min = Math.min(...values);
                      return (
                        <tr key={metric.key}>
                          <th scope="row">{metric.label}</th>
                          {picked.map((c) => {
                            const val = value(c, metric);
                            const available = Number.isFinite(val);
                            const year = metric.indicator
                              ? data[c.cca3]?.values[metric.key]?.year
                              : null;
                            return (
                              <td key={c.cca3}>
                                <strong>
                                  {available
                                    ? metric.format(val)
                                    : metric.indicator && loading
                                      ? "Loading…"
                                      : "Unavailable"}
                                </strong>
                                <div className="cell-meta">
                                  {year && <span>{year}</span>}
                                  {available &&
                                    values.length > 1 &&
                                    max !== min &&
                                    (val === max ? (
                                      <span className="value-high">
                                        Highest
                                      </span>
                                    ) : val === min ? (
                                      <span className="value-low">Lowest</span>
                                    ) : null)}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="panel-note">
                <Info size={13} /> Highest and lowest refer to available values,
                not rankings of quality. Missing data is never treated as zero.
              </p>
            </section>
            <div className="charts-grid">
              {[metrics[0], metrics[2], metrics[4]].map((metric) => {
                const max = Math.max(
                  0,
                  ...picked
                    .map((c) => value(c, metric))
                    .filter(Number.isFinite),
                );
                return (
                  <section className="panel" key={metric.key}>
                    <PanelTitle
                      title={`${metric.label} comparison`}
                      subtitle={
                        metric.indicator
                          ? "World Bank · latest available year"
                          : "REST Countries · latest available estimates"
                      }
                    />
                    <div
                      className="comparison-chart"
                      role="img"
                      aria-label={`${metric.label} bar chart. Values are also available in the comparison table.`}
                    >
                      {picked.map((c, i) => {
                        const val = value(c, metric);
                        return (
                          <div className="chart-row" key={c.cca3}>
                            <div>
                              <span>
                                <span
                                  className="chart-dot"
                                  style={{ background: colors[i] }}
                                />
                                {c.name.common}
                              </span>
                              <strong>
                                {Number.isFinite(val)
                                  ? metric.format(val)
                                  : loading && metric.indicator
                                    ? "Loading…"
                                    : "Unavailable"}
                              </strong>
                            </div>
                            <div className="bar-track">
                              <div
                                style={{
                                  width:
                                    Number.isFinite(val) && max > 0
                                      ? `${(Math.max(0, val) / max) * 100}%`
                                      : "0%",
                                  background: colors[i],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </DataState>
    </>
  );
}
