const COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,cca3,capital,population,area,region,flags,languages,currencies,borders'
export const INDICATORS = {
  gdp: { code: 'NY.GDP.MKTP.CD', label: 'GDP', unit: 'USD' },
  gdpPerCapita: { code: 'NY.GDP.PCAP.CD', label: 'GDP per capita', unit: 'USD' },
  lifeExpectancy: { code: 'SP.DYN.LE00.IN', label: 'Life expectancy', unit: 'years' },
  internet: { code: 'IT.NET.USER.ZS', label: 'Internet users', unit: '%' },
}
export async function fetchJSON(url, signal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`The data service returned ${response.status}. Please try again shortly.`)
  return response.json()
}
export async function getCountries(signal) {
  const data = await fetchJSON(COUNTRIES_URL, signal)
  if (!Array.isArray(data) || !data.length) throw new Error('The country service returned no country data.')
  return data.filter(c => c.cca3 && c.name?.common).sort((a, b) => a.name.common.localeCompare(b.name.common))
}
const cache = new Map()
export async function getIndicators(code, signal) {
  if (cache.has(code)) return cache.get(code)
  const results = await Promise.allSettled(Object.entries(INDICATORS).map(async ([key, indicator]) => {
    const data = await fetchJSON(`https://api.worldbank.org/v2/country/${encodeURIComponent(code)}/indicator/${indicator.code}?format=json&per_page=30`, signal)
    if (!Array.isArray(data?.[1])) throw new Error('The World Bank returned an unexpected response.')
    const latest = data[1].find(row => typeof row.value === 'number')
    return [key, latest ? { value: latest.value, year: latest.date } : null]
  }))
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  const values = Object.fromEntries(results.filter(r => r.status === 'fulfilled').map(r => r.value))
  const failed = results.filter(r => r.status === 'rejected').length
  const result = { values, failed }
  if (!failed) cache.set(code, result)
  return result
}
