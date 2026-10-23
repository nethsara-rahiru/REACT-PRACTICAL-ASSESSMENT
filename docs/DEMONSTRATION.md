# WorldScope demonstration guide

## Suggested walkthrough

1. Run `npm install` and `npm run dev`. Keep browser developer tools available to inspect network requests.
2. On **Dashboard**, explain that totals are derived from the returned country list. Identify the highest population and open a highlighted country.
3. In **Explore**, search for Sri Lanka, clear the search, filter to Asia, sort by population, and switch between grid and list. Try a search with no results and clear the filters.
4. Open `/country/LKA`. Explain how `:code` identifies the country. Show capital, languages, currencies, and all four World Bank indicators with reporting years. Open India to demonstrate navigation to a neighboring country.
5. Add Sri Lanka and India to **Compare**. Add a third and fourth country; show that duplicates and a fifth country cannot be selected. Explain the table, highest/lowest labels, and population/GDP/life-expectancy charts. Remove a country. Discuss why missing values must not become zero.
6. In **Settings**, submit blank fields and a two-character name to demonstrate field errors. Save a valid name, Asia, Sri Lanka, and population sorting. Reload, return to Dashboard and Explore, and show applied preferences.
7. Demonstrate cancellation and confirmation of reset. Toggle the theme and reload to show that it persists independently.
8. Resize to mobile and tablet. Open the mobile menu and navigate. Visit `/does-not-exist` to demonstrate recovery from a 404.
9. Block REST Countries in browser developer tools, reload, and show the error/retry state. Unblock and retry. Optionally block one World Bank indicator to demonstrate partial-data handling.
10. Run `npm run lint`, `npm run build`, and `npm test` (after installing Playwright Chromium). Explain that deterministic tests do not certify live public API availability.

## Code to be ready to explain

- `src/App.jsx`: route definitions and shared layout.
- `src/context/AppContext.jsx`: shared countries, theme, preferences, and comparison selections; effect cleanup and retry.
- `src/services/api.js`: checked fetch responses, timeout, `Promise.allSettled`, latest numeric observation, and successful-result cache.
- `src/components/Indicators.jsx`: request-key-based rendering and cancellation to avoid stale country values.
- `src/pages/Explore.jsx`: derived filtering/sorting, URL parameters, and incremental card display.
- `src/pages/Compare.jsx`: distinct selection limits, missing-value checks, comparison extrema, SVG-free CSS bar charts, and reporting years.
- `src/pages/Settings.jsx`: controlled inputs, field validation, safe persistence, and accessible reset confirmation.

## Evidence and limitations

The screenshots are intentionally generated with test fixtures because the initial cloud network policy blocked the public APIs. The interface and routing were exercised in Chromium. They do not establish live API freshness or availability. Enable the required domains and perform the live walkthrough before submission.

REST Countries supplies total surface area; World Bank supplies development statistics, often from different reporting years. Country and territory coverage differs. The map is an illustrative geographic backdrop rather than a visualization of population or GDP.

No account, backend, or server-side database is required. Profile settings remain in the browser. Never claim an automated demonstration is the student's own explanation of the code: review these files and explain the behavior in your own words.
