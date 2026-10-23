import { test, expect } from "@playwright/test";
import { mockAPIs } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockAPIs(page);
});

test("dashboard summarizes data and navigates to countries", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your world, at a glance." }),
  ).toBeVisible();
  await expect(page.locator(".stat-value").first()).toHaveText("8");
  await expect(page.locator(".stat-value").last()).toHaveText("China");
  await expect(page.locator(".map-country")).toHaveCount(176);
  await page
    .getByRole("link", { name: "Explore countries", exact: false })
    .last()
    .click();
  await expect(page).toHaveURL(/explore/);
});

test("explorer search, region, sorting, list view and empty results", async ({
  page,
}) => {
  await page.goto("/explore");
  const cards = page.locator(".country-card");
  await expect(cards).toHaveCount(8);
  await page.getByLabel("Search countries", { exact: true }).fill("Sri");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Sri Lanka");
  await page.getByRole("button", { name: "Clear search" }).click();
  await page.getByLabel("Region", { exact: true }).selectOption("Asia");
  await expect(cards).toHaveCount(3);
  await page.getByLabel("Sort countries").selectOption("population");
  await expect(cards.first()).toContainText("China");
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page.locator(".list-card")).toHaveCount(3);
  await page
    .getByLabel("Search countries", { exact: true })
    .fill("doesnotexist");
  await expect(
    page.getByRole("heading", { name: "No countries found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(cards).toHaveCount(8);
});

test("details show country facts, latest reporting years and neighbor links", async ({
  page,
}) => {
  await page.goto("/country/IND");
  await expect(
    page.getByRole("heading", { name: "India", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Reported in 2024")).toHaveCount(4);
  await expect(page.getByText("Hindi, English")).toBeVisible();
  await page.locator(".neighbors").getByRole("link", { name: /China/ }).click();
  await expect(page).toHaveURL("/country/CHN");
  await expect(
    page.getByRole("heading", { name: "China", exact: true }),
  ).toBeVisible();
  await page.goto("/country/invalid");
  await expect(
    page.getByRole("heading", { name: "Country not found" }),
  ).toBeVisible();
});

test("comparison supports 2–4 distinct countries, charts and missing values", async ({
  page,
}) => {
  await page.unroute("https://api.worldbank.org/**");
  await mockAPIs(page, { missing: true });
  await page.goto("/compare");
  const add = page.getByLabel("Add a country to compare");
  await add.selectOption("LKA");
  await expect(add.locator('option[value="LKA"]')).toHaveCount(0);
  await add.selectOption("IND");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("row", { name: /GDP \(USD\)/ })).toContainText(
    "Unavailable",
  );
  await expect(page.getByRole("row", { name: /Population/ })).toContainText(
    "Highest",
  );
  await expect(page.locator(".comparison-chart")).toHaveCount(3);
  await add.selectOption("CHN");
  await add.selectOption("USA");
  await expect(add).toHaveCount(0);
  await page.getByRole("button", { name: "Remove India", exact: true }).click();
  await expect(page.getByLabel("Add a country to compare")).toBeVisible();
  await expect(page.locator(".selection-chip")).toHaveCount(3);
});

test("settings validate fields, persist, apply preferences and confirm reset", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByText("Please enter your profile name.")).toBeVisible();
  await expect(
    page.getByText("Please choose a preferred region."),
  ).toBeVisible();
  await page.getByLabel("Profile name").fill("Al");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByText("Your name must contain 3–30 characters."),
  ).toBeVisible();
  await page.getByLabel("Profile name").fill("Alex");
  await page.getByLabel("Preferred region").selectOption("Asia");
  await page.getByLabel("Preferred country").selectOption("LKA");
  await page.getByLabel("Default sort order").selectOption("population");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("status")).toContainText("Preferences saved");
  await page.reload();
  await expect(page.getByLabel("Profile name")).toHaveValue("Alex");
  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Alex");
  await expect(
    page.locator(".dashboard-countries .country-card").first(),
  ).toContainText("Sri Lanka");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Explore countries", exact: true })
    .click();
  await expect(page.getByLabel("Region", { exact: true })).toHaveValue("Asia");
  await expect(page.getByLabel("Sort countries")).toHaveValue("population");
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Reset defaults" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep preferences" }).click();
  await expect(page.getByLabel("Profile name")).toHaveValue("Alex");
  await page.getByRole("button", { name: "Reset defaults" }).click();
  await page
    .getByRole("button", { name: "Reset preferences", exact: true })
    .click();
  await expect(page.getByLabel("Profile name")).toHaveValue("");
});

test("theme persists and mobile navigation has no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Explore countries", exact: true })
    .click();
  await expect(page.locator(".sidebar")).not.toHaveClass(/is-open/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("API failure offers retry and recovers without reloading", async ({
  page,
}) => {
  await page.route("https://restcountries.com/**", (route) =>
    route.fulfill({ status: 503, body: "Service unavailable" }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("503");
  await page.unroute("https://restcountries.com/**");
  await mockAPIs(page);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".stat-value").first()).toHaveText("8");
});

test("rapid country navigation does not display stale development data", async ({
  page,
}) => {
  await page.unroute("https://api.worldbank.org/**");
  await mockAPIs(page, { slow: true });
  await page.goto("/country/IND");
  await page.locator(".neighbors").getByRole("link", { name: /China/ }).click();
  await expect(page.locator(".indicator").first()).toContainText("$18T");
  await page.waitForTimeout(650);
  await expect(page.locator(".indicator").first()).toContainText("$18T");
});

test("unknown routes display the 404 page", async ({ page }) => {
  await page.goto("/unknown-path");
  await expect(
    page.getByRole("heading", { name: "A little off the map." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to dashboard" }).click();
  await expect(page).toHaveURL("/");
});

test("partial indicator failures preserve available metrics and can retry", async ({
  page,
}) => {
  await page.route(
    "https://api.worldbank.org/**/indicator/NY.GDP.MKTP.CD?*",
    (route) => route.fulfill({ status: 503 }),
  );
  await page.goto("/country/LKA");
  await expect(page.getByRole("alert")).toContainText("couldn’t be loaded");
  await expect(page.locator(".indicator").first()).toContainText("Unavailable");
  await expect(page.locator(".indicator").nth(2)).toContainText("76.5");
  await page.unroute("https://api.worldbank.org/**/indicator/NY.GDP.MKTP.CD?*");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".indicator").first()).toContainText("$84B");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("all major views fit mobile and tablet without page overflow", async ({
  page,
}) => {
  for (const width of [360, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/explore",
      "/country/LKA",
      "/compare",
      "/settings",
      "/404",
    ]) {
      await page.goto(route);
      if (route === "/compare") {
        await page.getByLabel("Add a country to compare").selectOption("IND");
        await page.getByLabel("Add a country to compare").selectOption("LKA");
        await expect(page.getByRole("table")).toBeVisible();
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} should fit ${width}px`,
      ).toBe(true);
    }
  }
});

test("World Bank fallback paginates, excludes aggregates and preserves missing metadata", async ({
  page,
}) => {
  await page.route("https://restcountries.com/**", (route) =>
    route.fulfill({ status: 503 }),
  );
  await page.route("https://api.worldbank.org/**", (route) => {
    const url = new URL(route.request().url());
    let rows;
    let pages = 1;
    if (url.pathname === "/v2/country") {
      pages = 2;
      rows =
        url.searchParams.get("page") === "2"
          ? [
              {
                id: "IND",
                iso2Code: "IN",
                name: "India",
                capitalCity: "New Delhi",
                region: { id: "SAS", value: "South Asia" },
              },
            ]
          : [
              {
                id: "LKA",
                iso2Code: "LK",
                name: "Sri Lanka",
                capitalCity: "Colombo",
                region: { id: "SAS", value: "South Asia" },
              },
              {
                id: "WLD",
                name: "World",
                region: { id: "NA", value: "Aggregates" },
              },
            ];
    } else if (url.pathname.includes("SP.POP.TOTL"))
      rows = [
        { countryiso3code: "LKA", value: 21756000, date: "2025" },
        { countryiso3code: "IND", value: 1460000000, date: "2025" },
        { countryiso3code: "WLD", value: 8000000000, date: "2025" },
      ];
    else if (url.pathname.includes("AG.SRF.TOTL.K2"))
      rows = [{ countryiso3code: "LKA", value: 65610, date: "2024" }];
    else rows = [{ value: 77, date: "2024" }];
    return route.fulfill({ json: [{ pages }, rows] });
  });
  await page.goto("/");
  await expect(page.locator(".stat-value").first()).toHaveText("2");
  await expect(page.getByRole("status")).toContainText("Using live World Bank");
  await page.goto("/country/LKA");
  await expect(
    page.getByRole("heading", { name: "Sri Lanka", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Border information unavailable" }),
  ).toBeVisible();
  await expect(page.locator(".detail-stat-value").nth(1)).toHaveText(
    "65,610 km²",
  );
});
