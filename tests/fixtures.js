// Deterministic test data only. The application never imports these fixtures.
const country = (
  name,
  cca3,
  capital,
  population,
  area,
  region,
  borders,
  language,
  currency,
) => ({
  name: { common: name, official: name },
  cca3,
  capital: [capital],
  population,
  area,
  region,
  borders,
  languages: { lang: language },
  currencies: { CUR: { name: currency, symbol: "$" } },
  flags: { svg: `https://flagcdn.com/${cca3.toLowerCase()}.svg` },
});
export const countries = [
  country(
    "Sri Lanka",
    "LKA",
    "Sri Jayawardenepura Kotte",
    21919000,
    65610,
    "Asia",
    [],
    "Sinhala, Tamil",
    "Sri Lankan rupee",
  ),
  country(
    "India",
    "IND",
    "New Delhi",
    1400000000,
    3287590,
    "Asia",
    ["CHN"],
    "Hindi, English",
    "Indian rupee",
  ),
  country(
    "China",
    "CHN",
    "Beijing",
    1410000000,
    9706961,
    "Asia",
    ["IND"],
    "Chinese",
    "Chinese yuan",
  ),
  country(
    "United States",
    "USA",
    "Washington, D.C.",
    329484123,
    9372610,
    "Americas",
    ["CAN"],
    "English",
    "United States dollar",
  ),
  country(
    "Canada",
    "CAN",
    "Ottawa",
    38005238,
    9984670,
    "Americas",
    ["USA"],
    "English, French",
    "Canadian dollar",
  ),
  country(
    "Germany",
    "DEU",
    "Berlin",
    83240525,
    357114,
    "Europe",
    [],
    "German",
    "Euro",
  ),
  country(
    "Brazil",
    "BRA",
    "Brasília",
    212559409,
    8515767,
    "Americas",
    [],
    "Portuguese",
    "Brazilian real",
  ),
  country(
    "Australia",
    "AUS",
    "Canberra",
    25687041,
    7692024,
    "Oceania",
    [],
    "English",
    "Australian dollar",
  ),
];
export async function mockAPIs(page, { missing = false, slow = false } = {}) {
  await page.route("https://restcountries.com/**", (route) =>
    route.fulfill({ json: countries }),
  );
  await page.route("https://flagcdn.com/**", (route) => {
    const code = route.request().url().split("/").pop().split(".")[0];
    const palettes = {
      chn: ["#de2910", "#de2910", "#de2910"],
      ind: ["#ff9933", "#fff", "#138808"],
      usa: ["#b22234", "#fff", "#b22234"],
      lka: ["#ffb700", "#8d153a", "#ffb700"],
    };
    const colors = palettes[code] || ["#29745b", "#fff", "#29745b"];
    return route.fulfill({
      contentType: "image/svg+xml",
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180"><rect width="300" height="60" fill="${colors[0]}"/><rect y="60" width="300" height="60" fill="${colors[1]}"/><rect y="120" width="300" height="60" fill="${colors[2]}"/></svg>`,
    });
  });
  await page.route("https://api.worldbank.org/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/country?"))
      return route.fulfill({ status: 503, body: "World Bank unavailable" });
    if (slow && url.includes("/IND/"))
      await new Promise((resolve) => setTimeout(resolve, 500));
    const code = url.split("/country/")[1].split("/")[0];
    const base =
      {
        IND: 3500000000000,
        CHN: 18000000000000,
        LKA: 84000000000,
        USA: 27000000000000,
      }[code] || 1000000000000;
    const value =
      missing && code === "LKA"
        ? null
        : url.includes("LE00")
          ? 76.5
          : url.includes("NET.USER")
            ? 84.3
            : url.includes("PCAP")
              ? base / 50000000
              : base;
    await route.fulfill({
      json: [
        { page: 1 },
        [
          { value: null, date: "2025" },
          { value, date: "2024" },
        ],
      ],
    });
  });
}
