import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import world from "world-atlas/countries-110m.json";
import { useState } from "react";
const countries = feature(world, world.objects.countries).features;
const projection = geoNaturalEarth1().fitExtent(
  [
    [12, 10],
    [808, 340],
  ],
  {
    type: "FeatureCollection",
    features: countries.filter((c) => c.id !== "010"),
  },
);
const path = geoPath(projection);
export default function WorldMap() {
  const [hover, setHover] = useState("");
  return (
    <div className="map-wrapper">
      <svg
        viewBox="0 0 820 350"
        role="img"
        aria-label="World map showing country boundaries"
      >
        <defs>
          <pattern
            id="map-dots"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.7" fill="currentColor" opacity="0.13" />
          </pattern>
        </defs>
        <rect width="820" height="350" fill="url(#map-dots)" />
        {countries
          .filter((c) => c.id !== "010")
          .map((country, i) => (
            <path
              key={country.id || country.properties.name}
              d={path(country)}
              className={`map-country map-shade-${i % 5}`}
              onMouseEnter={() => setHover(country.properties.name)}
              onMouseLeave={() => setHover("")}
            >
              <title>{country.properties.name}</title>
            </path>
          ))}
      </svg>
      <div className="map-caption">
        <span className="status-dot" />
        {hover || "One planet. Endless perspectives."}
      </div>
    </div>
  );
}
