const COUNTRIES_URL =
  "https://restcountries.com/v3.1/all?fields=name,cca3,capital,population,area,region,flags,languages,currencies,borders";
export const INDICATORS = {
  gdp: { code: "NY.GDP.MKTP.CD", label: "GDP", unit: "USD" },
  gdpPerCapita: {
    code: "NY.GDP.PCAP.CD",
    label: "GDP per capita",
    unit: "USD",
  },
  lifeExpectancy: {
    code: "SP.DYN.LE00.IN",
    label: "Life expectancy",
    unit: "years",
  },
  internet: { code: "IT.NET.USER.ZS", label: "Internet users", unit: "%" },
};
export async function fetchJSON(url, signal) {
  try {
    const timeout = AbortSignal.timeout(20000);
    const response = await fetch(url, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (!response.ok)
      throw new Error(
        `The data service returned ${response.status}. Please try again shortly.`,
      );
    return await response.json();
  } catch (error) {
    if (error.name === "TimeoutError")
      throw new Error(
        "The data service took too long to respond. Please try again.",
      );
    if (error instanceof TypeError)
      throw new Error(
        "Unable to connect to the data service. Check your connection and try again.",
      );
    throw error;
  }
}
const WB = "https://api.worldbank.org/v2";
async function worldBankPages(url, signal) {
  const first = await fetchJSON(`${url}&per_page=400&page=1`, signal);
  if (!Array.isArray(first?.[1]))
    throw new Error("World Bank returned no usable records.");
  const pages = Number(first[0]?.pages || 1);
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      fetchJSON(`${url}&per_page=400&page=${i + 2}`, signal),
    ),
  );
  if (rest.some((page) => !Array.isArray(page?.[1])))
    throw new Error("World Bank returned an incomplete page.");
  return [...first[1], ...rest.flatMap((page) => page[1])];
}
function continent(country) {
  const region = country.region.id;
  if (["SSF", "MEA"].includes(region)) {
    return region === "SSF" ||
      ["DZA", "EGY", "LBY", "MAR", "TUN", "DJI"].includes(country.id)
      ? "Africa"
      : "Asia";
  }
  if (["LCN", "NAC"].includes(region)) return "Americas";
  if (region === "SAS") return "Asia";
  if (region === "ECS")
    return [
      "ARM",
      "AZE",
      "GEO",
      "KAZ",
      "KGZ",
      "TJK",
      "TKM",
      "UZB",
      "TUR",
    ].includes(country.id)
      ? "Asia"
      : "Europe";
  if (region === "EAS")
    return [
      "AUS",
      "NZL",
      "FJI",
      "PNG",
      "SLB",
      "VUT",
      "WSM",
      "TON",
      "KIR",
      "TUV",
      "NRU",
      "PLW",
      "MHL",
      "FSM",
      "ASM",
      "GUM",
      "MNP",
      "NCL",
      "PYF",
    ].includes(country.id)
      ? "Oceania"
      : "Asia";
  return "Other";
}
async function getWorldBankCountries(signal) {
  const [metadata, populations, areas] = await Promise.all([
    worldBankPages(`${WB}/country?format=json`, signal),
    worldBankPages(
      `${WB}/country/all/indicator/SP.POP.TOTL?format=json&mrnev=1`,
      signal,
    ),
    worldBankPages(
      `${WB}/country/all/indicator/AG.SRF.TOTL.K2?format=json&mrnev=1`,
      signal,
    ).catch((error) => {
      if (signal?.aborted) throw error;
      return [];
    }),
  ]);
  const latest = (rows) => {
    const result = new Map();
    for (const row of rows) {
      if (!Number.isFinite(row.value)) continue;
      const previous = result.get(row.countryiso3code);
      if (!previous || Number(row.date) > Number(previous.date))
        result.set(row.countryiso3code, row);
    }
    return result;
  };
  const population = latest(populations),
    area = latest(areas);
  const countries = metadata
    .filter(
      (c) =>
        c.region?.id && c.region.id !== "NA" && c.region.value !== "Aggregates",
    )
    .map((c) => ({
      cca3: c.id,
      name: { common: c.name, official: c.name },
      capital: c.capitalCity ? [c.capitalCity] : [],
      population: population.get(c.id)?.value ?? null,
      populationYear: population.get(c.id)?.date,
      area: area.get(c.id)?.value ?? null,
      areaYear: area.get(c.id)?.date,
      region: continent(c),
      flags: c.iso2Code
        ? { svg: `https://flagcdn.com/${c.iso2Code.toLowerCase()}.svg` }
        : {},
      languages: {},
      currencies: {},
      borders: [],
      dataSource: "World Bank",
    }));
  if (!countries.length)
    throw new Error("World Bank returned no country records.");
  return countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
}
export async function getCountries(signal) {
  try {
    const data = await fetchJSON(COUNTRIES_URL, signal);
    const countries = Array.isArray(data)
      ? data.filter(
          (c) =>
            typeof c.cca3 === "string" && typeof c.name?.common === "string",
        )
      : [];
    if (!countries.length)
      throw new Error("The country service returned no country data.");
    return countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
  } catch (error) {
    if (signal?.aborted) throw error;
    try {
      return await getWorldBankCountries(signal);
    } catch (fallbackError) {
      if (signal?.aborted) throw fallbackError;
      throw new Error(
        `Both country sources are unavailable. REST Countries: ${error.message} World Bank: ${fallbackError.message}`,
      );
    }
  }
}
const cache = new Map();
export async function getIndicators(code, signal) {
  if (cache.has(code)) return cache.get(code);
  const results = await Promise.allSettled(
    Object.entries(INDICATORS).map(async ([key, indicator]) => {
      const data = await fetchJSON(
        `https://api.worldbank.org/v2/country/${encodeURIComponent(code)}/indicator/${indicator.code}?format=json&per_page=30`,
        signal,
      );
      if (!Array.isArray(data?.[1]))
        throw new Error("The World Bank returned an unexpected response.");
      const latest = data[1].find((row) => typeof row.value === "number");
      return [key, latest ? { value: latest.value, year: latest.date } : null];
    }),
  );
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const values = Object.fromEntries(
    results.filter((r) => r.status === "fulfilled").map((r) => r.value),
  );
  const failed = results.filter((r) => r.status === "rejected").length;
  const result = { values, failed };
  if (!failed) cache.set(code, result);
  return result;
}
