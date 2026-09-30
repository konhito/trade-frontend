'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react'
import { formatMoney, trackerApi, type TrackerData, type TrackerEntry, type TrackerSettings, type TrackerStrategy } from '@/lib/public-tracker'

type StrategyForm = Omit<TrackerStrategy, 'id'>
type EntryForm = Omit<TrackerEntry, 'id' | 'pnl'> & { pnl: string }

const blankStrategy: StrategyForm = { name: '', segment: '', description: '', capital: 0, subscribeUrl: '', externalId: '', active: true }
const panel = 'rounded-2xl border border-[#e1e8df] bg-white p-5 shadow-[0_8px_24px_rgba(16,40,30,0.045)]'
const field = 'w-full rounded-xl border border-[#d9e3d9] bg-white px-3 py-2.5 text-sm text-[#173126] outline-none focus:border-[#27865f] focus:ring-2 focus:ring-[#27865f]/15'
const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c7c55] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#176b49] disabled:cursor-wait disabled:opacity-50'

export default function PublicTrackerAdmin() {
  const [data, setData] = useState<TrackerData | null>(null)
  const [strategy, setStrategy] = useState<StrategyForm>(blankStrategy)
  const [strategyId, setStrategyId] = useState<number | null>(null)
  const [entry, setEntry] = useState<EntryForm>({ strategyId: 0, tradeDate: localDate(), pnl: '', note: '' })
  const [entryId, setEntryId] = useState<number | null>(null)
  const [settings, setSettings] = useState<TrackerSettings>({ title: 'DECAY HUNTERS — P&L Tracker', contactUrl: '', logoUrl: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)

  async function load(preserveMessage = false) {
    setLoading(true)
    try {
      const result = await trackerApi.load()
      setData(result)
      setSettings(result.settings)
      setEntry((current) => ({
        ...current,
        strategyId: result.strategies.some((item) => item.id === current.strategyId)
          ? current.strategyId
          : (result.strategies[0]?.id ?? 0),
      }))
      if (!preserveMessage) setMessage('')
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Could not load tracker data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function submitStrategy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      if (strategyId === null) await trackerApi.createStrategy(strategy)
      else await trackerApi.updateStrategy(strategyId, strategy)
      setStrategy(blankStrategy)
      setStrategyId(null)
      setFailed(false)
      setMessage(strategyId === null ? 'Strategy added.' : 'Strategy updated.')
      await load(true)
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Could not save strategy')
    } finally {
      setSaving(false)
    }
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const payload = { ...entry, pnl: Number(entry.pnl) }
      if (entryId === null) await trackerApi.createEntry(payload)
      else await trackerApi.updateEntry(entryId, payload)
      setEntry((current) => ({ ...current, pnl: '', note: '', tradeDate: localDate() }))
      setEntryId(null)
      setFailed(false)
      setMessage(entryId === null ? 'Daily result added.' : 'Daily result updated.')
      await load(true)
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Could not save daily result')
    } finally {
      setSaving(false)
    }
  }

  async function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const result = await trackerApi.updateSettings(settings)
      setData((current) => current ? { ...current, settings: result.settings } : current)
      setFailed(false)
      setMessage('Tracker settings saved.')
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  function editStrategy(item: TrackerStrategy) {
    setStrategyId(item.id)
    setStrategy({ name: item.name, segment: item.segment, description: item.description, capital: item.capital, subscribeUrl: item.subscribeUrl, externalId: item.externalId, active: item.active })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function editEntry(item: TrackerEntry) {
    setEntryId(item.id)
    setEntry({ strategyId: item.strategyId, tradeDate: item.tradeDate, pnl: String(item.pnl), note: item.note })
    document.getElementById('daily-entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function removeStrategy(item: TrackerStrategy) {
    if (!window.confirm(`Delete ${item.name} and all of its daily entries?`)) return
    setSaving(true)
    try {
      await trackerApi.deleteStrategy(item.id)
      if (strategyId === item.id) { setStrategy(blankStrategy); setStrategyId(null) }
      setFailed(false)
      setMessage('Strategy and its daily entries deleted.')
      await load(true)
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Could not delete strategy')
    } finally {
      setSaving(false)
    }
  }

  async function removeEntry(item: TrackerEntry) {
    if (!window.confirm(`Delete the ${item.tradeDate} entry?`)) return
    setSaving(true)
    try {
      await trackerApi.deleteEntry(item.id)
      if (entryId === item.id) setEntryId(null)
      setFailed(false)
      setMessage('Daily result deleted.')
      await load(true)
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Could not delete daily result')
    } finally {
      setSaving(false)
    }
  }

  const strategies = data?.strategies ?? []
  const entries = data?.entries ?? []
  const strategyNames = new Map(strategies.map((item) => [item.id, item.name]))

  return (
    <main className="min-h-screen bg-[#f4f6f1] px-4 py-6 text-[#173126] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/tracker" className="inline-flex items-center gap-2 text-sm font-bold text-[#52645a] hover:text-[#1c7c55]"><ArrowLeft size={16} /> Back to tracker</Link>
        <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1c7c55]">Public performance report</p><h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Tracker manager</h1><p className="mt-2 text-sm text-[#75827a]">Update the public report, strategy details, and daily results.</p></div>
          <button type="button" className={`${button} bg-white !text-[#245d43] ring-1 ring-[#d9e3d9] hover:bg-[#edf4ed]`} onClick={() => void load()} disabled={loading || saving}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh data</button>
        </header>

        {message && <p role="status" className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${failed ? 'border-[#efc0b8] bg-[#fff2ef] text-[#a33c31]' : 'border-[#cce5d3] bg-[#edf8ef] text-[#176b49]'}`}>{message}</p>}

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <form className={panel} onSubmit={submitStrategy}>
            <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#75827a]">Strategies</p><h2 className="mt-1 text-xl font-black">{strategyId === null ? 'Add strategy' : 'Edit strategy'}</h2></div>{strategyId !== null && <button type="button" aria-label="Cancel strategy edit" onClick={() => { setStrategyId(null); setStrategy(blankStrategy) }} className="rounded-lg p-2 text-[#75827a] hover:bg-[#f1f5ef]"><X size={18} /></button>}</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a]">Strategy name<input required maxLength={191} className={field} value={strategy.name} onChange={(event) => setStrategy({ ...strategy, name: event.target.value })} /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a]">Segment<input required maxLength={191} className={field} value={strategy.segment} onChange={(event) => setStrategy({ ...strategy, segment: event.target.value })} /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a]">Capital (₹)<input required type="number" min="0" step="0.01" className={field} value={strategy.capital} onChange={(event) => setStrategy({ ...strategy, capital: Number(event.target.value) })} /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a]">Strategy ID<input maxLength={191} className={field} value={strategy.externalId} onChange={(event) => setStrategy({ ...strategy, externalId: event.target.value })} /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a] sm:col-span-2">Subscription / details link<input type="url" className={field} value={strategy.subscribeUrl} onChange={(event) => setStrategy({ ...strategy, subscribeUrl: event.target.value })} placeholder="https://…" /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a] sm:col-span-2">Description<textarea rows={3} maxLength={5000} className={field} value={strategy.description} onChange={(event) => setStrategy({ ...strategy, description: event.target.value })} /></label>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#52645a] sm:col-span-2"><input type="checkbox" checked={strategy.active} onChange={(event) => setStrategy({ ...strategy, active: event.target.checked })} className="h-4 w-4 accent-[#1c7c55]" /> Show this strategy on the public page</label>
            </div>
            <button className={`${button} mt-4`} disabled={saving}>{strategyId === null ? <Plus size={16} /> : <Save size={16} />}{saving ? 'Saving…' : strategyId === null ? 'Add strategy' : 'Save changes'}</button>
          </form>

          <form id="daily-entry-form" className={panel} onSubmit={submitEntry}>
            <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#75827a]">Daily results</p><h2 className="mt-1 text-xl font-black">{entryId === null ? 'Add daily P&L' : 'Edit daily P&L'}</h2></div>{entryId !== null && <button type="button" aria-label="Cancel daily result edit" onClick={() => { setEntryId(null); setEntry((current) => ({ ...current, pnl: 0, note: '' })) }} className="rounded-lg p-2 text-[#75827a] hover:bg-[#f1f5ef]"><X size={18} /></button>}</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a] sm:col-span-2">Strategy<select required className={field} value={entry.strategyId || ''} onChange={(event) => setEntry({ ...entry, strategyId: Number(event.target.value) })} disabled={loading || !strategies.length}><option value="">{loading ? 'Loading…' : 'Choose a strategy'}</option>{strategies.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? '' : ' (hidden)'}</option>)}</select></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a]">Trading date<input required type="date" className={field} value={entry.tradeDate} onChange={(event) => setEntry({ ...entry, tradeDate: event.target.value })} /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a]">Daily P&amp;L (₹)<input required type="number" step="0.01" className={field} value={entry.pnl} onChange={(event) => setEntry({ ...entry, pnl: event.target.value })} /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#52645a] sm:col-span-2">Note<input maxLength={2000} className={field} value={entry.note} onChange={(event) => setEntry({ ...entry, note: event.target.value })} /></label>
            </div>
            <button className={`${button} mt-4`} disabled={saving || loading || !strategies.length}>{saving ? 'Saving…' : entryId === null ? <><Plus size={16} /> Add result</> : <><Save size={16} /> Save changes</>}</button>
          </form>
        </section>

        <form className={`${panel} mt-4`} onSubmit={submitSettings}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#75827a]">Public page</p><h2 className="mt-1 text-xl font-black">Brand and contact</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="grid gap-1.5 text-xs font-semibold text-[#52645a]">Page title<input required maxLength={191} className={field} value={settings.title} onChange={(event) => setSettings({ ...settings, title: event.target.value })} /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-[#52645a]">Contact link<input type="url" className={field} value={settings.contactUrl} onChange={(event) => setSettings({ ...settings, contactUrl: event.target.value })} placeholder="https://…" /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-[#52645a]">Logo image URL<input className={field} value={settings.logoUrl} onChange={(event) => setSettings({ ...settings, logoUrl: event.target.value })} placeholder="/tracker-logo.png" /></label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#75827a]">Use a site-relative path for an image shipped in <code className="rounded bg-[#f1f5ef] px-1 py-0.5">public/</code>, or an HTTPS image URL.</p><button className={button} disabled={saving}><Save size={16} /> Save page settings</button></div>
        </form>

        <section className={`${panel} mt-4`}>
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#75827a]">Public page data</p><h2 className="mt-1 text-xl font-black">Manage strategies</h2></div><span className="text-sm text-[#75827a]">{loading ? 'Loading…' : `${strategies.length} total`}</span></div>
          <div className="mt-4 grid gap-2">
            {!loading && !strategies.length && <p className="rounded-xl bg-[#f4f6f1] p-4 text-sm text-[#75827a]">No strategies yet. Add one above to start the report.</p>}
            {strategies.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e6ece4] bg-[#fbfcfa] p-3.5">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><b className="truncate">{item.name}</b><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.active ? 'bg-[#e9f5ed] text-[#19734f]' : 'bg-[#eef0ed] text-[#75827a]'}`}>{item.active ? 'Visible' : 'Hidden'}</span></div><p className="mt-1 text-xs text-[#75827a]">{item.segment} · Capital ₹{item.capital.toLocaleString('en-IN')}</p></div>
              <div className="flex items-center gap-2"><button type="button" disabled={saving} onClick={() => editStrategy(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9e3d9] px-3 py-2 text-xs font-bold text-[#52645a] hover:bg-[#edf4ed] disabled:opacity-50"><Pencil size={14} /> Edit</button><button type="button" disabled={saving} onClick={() => void removeStrategy(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#f0d2ce] px-3 py-2 text-xs font-bold text-[#b04439] hover:bg-[#fff2ef] disabled:opacity-50"><Trash2 size={14} /> Delete</button></div>
            </div>)}
          </div>
        </section>

        <section className={`${panel} mt-4`}>
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#75827a]">Public page data</p><h2 className="mt-1 text-xl font-black">Manage daily results</h2></div><span className="text-sm text-[#75827a]">{loading ? 'Loading…' : `${entries.length} total`}</span></div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-[#75827a]"><tr><th className="pb-3 font-semibold">Date</th><th className="pb-3 font-semibold">Strategy</th><th className="pb-3 text-right font-semibold">P&amp;L</th><th className="pb-3 font-semibold">Note</th><th className="pb-3 text-right font-semibold">Actions</th></tr></thead>
              <tbody>{entries.map((item) => <tr key={item.id} className="border-t border-[#edf1eb]"><td className="py-3">{item.tradeDate}</td><td className="py-3 font-semibold">{strategyNames.get(item.strategyId) ?? 'Removed strategy'}</td><td className={`py-3 text-right font-bold tabular-nums ${item.pnl < 0 ? 'text-[#c74f42]' : 'text-[#18805a]'}`}>{formatMoney(item.pnl)}</td><td className="max-w-[300px] truncate py-3 text-[#75827a]">{item.note || '—'}</td><td className="py-3"><div className="flex justify-end gap-2"><button type="button" disabled={saving} onClick={() => editEntry(item)} aria-label={`Edit ${item.tradeDate} entry`} className="rounded-lg border border-[#d9e3d9] p-2 text-[#52645a] hover:bg-[#edf4ed] disabled:opacity-50"><Pencil size={14} /></button><button type="button" disabled={saving} onClick={() => void removeEntry(item)} aria-label={`Delete ${item.tradeDate} entry`} className="rounded-lg border border-[#f0d2ce] p-2 text-[#b04439] hover:bg-[#fff2ef] disabled:opacity-50"><Trash2 size={14} /></button></div></td></tr>)}</tbody>
            </table>
            {!loading && !entries.length && <p className="rounded-xl bg-[#f4f6f1] p-4 text-sm text-[#75827a]">No daily results yet.</p>}
          </div>
        </section>

        <footer className="flex items-center gap-2 py-5 text-xs text-[#75827a]"><Check size={14} /> Changes are written to the shared tracker database.</footer>
      </div>
    </main>
  )
}

function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
