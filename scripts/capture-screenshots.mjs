import { chromium } from "@playwright/test";
import { mockAPIs } from "../tests/fixtures.js";
import { mkdir } from "node:fs/promises";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
    deviceScaleFactor: 1,
  });
  await mockAPIs(page);
  const base = "http://127.0.0.1:5173";
  await page.goto(base);
  await page.locator(".country-card").first().waitFor();
  await page.screenshot({
    path: "docs/screenshots/dashboard.png",
    fullPage: true,
  });
  await page.goto(`${base}/explore`);
  await page.locator(".country-card").first().waitFor();
  await page.screenshot({
    path: "docs/screenshots/explore.png",
    fullPage: true,
  });
  await page.goto(`${base}/country/LKA`);
  await page.getByText("Reported in 2024").first().waitFor();
  await page.screenshot({
    path: "docs/screenshots/country-details.png",
    fullPage: true,
  });
  await page.goto(`${base}/compare`);
  for (const code of ["LKA", "IND", "USA"])
    await page.getByLabel("Add a country to compare").selectOption(code);
  await page.getByText("$27T").first().waitFor();
  await page.screenshot({
    path: "docs/screenshots/compare.png",
    fullPage: true,
  });
  for (const [route, file] of [
    ["settings", "settings"],
    ["not-found", "not-found"],
  ]) {
    await page.goto(`${base}/${route}`);
    await page.screenshot({
      path: `docs/screenshots/${file}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.locator(".country-card").first().waitFor();
  await page.screenshot({
    path: "docs/screenshots/mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.screenshot({
    path: "docs/screenshots/dark-mobile.png",
    fullPage: true,
  });
  console.log(
    "Saved eight UI screenshots using test fixtures (not live API data).",
  );
} finally {
  await browser.close();
}
