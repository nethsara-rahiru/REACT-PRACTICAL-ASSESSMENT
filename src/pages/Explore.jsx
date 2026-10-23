import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PageHeading, DataState, Empty, CountryCard } from '../components/UI'
import { regions, sortCountries } from '../utils/format'
export default function Explore() {
  const { countries, preferences } = useApp()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') || '')
  const [region, setRegion] = useState(params.get('region') ?? preferences.region)
  const [sort, setSort] = useState(params.get('sort') || preferences.sort)
  const [view, setView] = useState('grid')
  const [limit, setLimit] = useState(24)
  useEffect(() => { setLimit(24) }, [search, region, sort])
  useEffect(() => { const next = {}; if (search) next.q = search; if (region) next.region = region; next.sort = sort; setParams(next, { replace: true }) }, [search, region, sort, setParams])
  const results = sortCountries(countries.filter(c => c.name.common.toLowerCase().includes(search.toLowerCase().trim()) && (!region || c.region === region)), sort)
  function clear() { setSearch(''); setRegion(''); setSort('name') }
  return <><PageHeading eyebrow="DISCOVER SOMETHING NEW" title="A world of discovery." description="From familiar places to faraway corners, find your next perspective."/><DataState><div className="explore-toolbar"><label className="search-field"><Search size={19}/><span className="sr-only">Search countries</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for a country…"/>{search && <button className="icon-button" onClick={() => setSearch('')} aria-label="Clear search"><X size={16}/></button>}</label><div className="toolbar-select"><SlidersHorizontal size={16}/><label className="sr-only" htmlFor="region">Region</label><select id="region" value={region} onChange={e => setRegion(e.target.value)}><option value="">All regions</option>{regions.map(r => <option key={r}>{r}</option>)}</select></div><label className="sort-select"><span>Sort by:</span><select aria-label="Sort countries" value={sort} onChange={e => setSort(e.target.value)}><option value="name">Name (A–Z)</option><option value="population">Population</option><option value="area">Land area</option></select></label><div className="view-switch"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><LayoutGrid size={18}/></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}><List size={18}/></button></div></div><div className="results-line"><span><strong>{results.length}</strong> countries & territories {region && `in ${region}`}</span>{(search || region) ? <button className="text-button" onClick={clear}>Clear filters <X size={13}/></button> : <span>Select <strong>+</strong> on a country to compare</span>}</div>{results.length ? <><div className={view === 'grid' ? 'country-grid' : 'country-list'}>{results.slice(0, limit).map(c => <CountryCard key={c.cca3} country={c} list={view === 'list'}/>)}</div>{limit < results.length && <div className="load-more"><button className="button" onClick={() => setLimit(l => l + 24)}>Show more countries <span className="subtle-badge">{results.length - limit} more</span></button></div>}</> : <Empty><button className="button" onClick={clear}>Clear filters</button></Empty>}</DataState></>
}
