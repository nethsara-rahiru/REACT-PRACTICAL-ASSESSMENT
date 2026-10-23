export const number = value => Number.isFinite(value) ? new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(value) : 'Unavailable'
export const compact = value => Number.isFinite(value) ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value) : 'Unavailable'
export const money = value => Number.isFinite(value) ? `$${compact(value)}` : 'Unavailable'
export const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic']
export function sortCountries(countries, sort) {
  return [...countries].sort((a, b) => sort === 'population' ? (b.population ?? -1) - (a.population ?? -1) : sort === 'area' ? (b.area ?? -1) - (a.area ?? -1) : a.name.common.localeCompare(b.name.common))
}
