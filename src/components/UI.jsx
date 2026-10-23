import { AlertCircle, ArrowUpRight, Check, Plus, Search, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { compact } from '../utils/format'
export function PageHeading({ eyebrow, title, description, children }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div><div className="heading-actions">{children}</div></div>
}
export function DataState({ children }) {
  const { loading, error, retry } = useApp()
  if (loading) return <div className="state-box" role="status"><RefreshCw className="spin" size={25}/><h3>Connecting the world…</h3><p>Loading the latest country information.</p></div>
  if (error) return <div className="state-box" role="alert"><AlertCircle size={28}/><h3>We couldn’t load country data</h3><p>{error} Check your connection and access to restcountries.com.</p><button className="button primary" onClick={retry}><RefreshCw size={16}/> Try again</button></div>
  return children
}
export function Empty({ title = 'No countries found', text = 'Try a different search or clear your filters.', children }) {
  return <div className="state-box"><Search size={28}/><h3>{title}</h3><p>{text}</p>{children}</div>
}
export function Flag({ country, large = false }) {
  const [failed, setFailed] = useState(false)
  return country.flags?.svg && !failed ? <img className={large ? 'flag flag-large' : 'flag'} src={country.flags.svg} alt={`${country.name.common} flag`} onError={() => setFailed(true)} loading="lazy"/> : <span className="flag flag-placeholder" aria-label={`${country.name.common} flag unavailable`}>{country.cca3}</span>
}
import { useState } from 'react'
export function CountryCard({ country, list = false }) {
  const { selected, toggleCountry } = useApp()
  const checked = selected.includes(country.cca3)
  return <article className={`country-card ${list ? 'list-card' : ''}`}><Link to={`/country/${country.cca3}`} className="country-image"><Flag country={country} large/><span className="region-tag">{country.region || 'Other'}</span></Link><div className="country-card-body"><div className="country-title"><Link to={`/country/${country.cca3}`}><h3>{country.name.common}</h3></Link><button className={`icon-button compare-add ${checked ? 'active' : ''}`} disabled={!checked && selected.length >= 4} onClick={() => toggleCountry(country.cca3)} aria-label={`${checked ? 'Remove' : 'Compare'} ${country.name.common}`} title={checked ? 'Remove from comparison' : selected.length >= 4 ? 'Comparison limit reached' : 'Add to comparison'}>{checked ? <Check size={17}/> : <Plus size={17}/>}</button></div><p className="capital">{country.capital?.join(', ') || 'Capital unavailable'}</p><div className="country-facts"><span>Population<strong>{compact(country.population)}</strong></span><span>Area<strong>{compact(country.area)} <small>km²</small></strong></span><Link to={`/country/${country.cca3}`} aria-label={`View ${country.name.common}`}><ArrowUpRight size={19}/></Link></div></div></article>
}
export function PanelTitle({ title, subtitle, children }) { return <div className="panel-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{children}</div> }
