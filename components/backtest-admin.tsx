'use client'

import { useEffect, useState } from 'react'
import { reportsBase, reportTitles, rupees, reportPrice, type ReportSettings } from '@/lib/backtest-reports'

export default function BacktestAdmin() {
  const [reports, setReports] = useState<ReportSettings[]>([])
  const [key, setKey] = useState('')
  const [files, setFiles] = useState<Record<number, File | undefined>>({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState<number | null>(null)
  useEffect(() => { fetch(reportsBase, { cache: 'no-store' }).then(async r => { if (!r.ok) throw new Error(); setReports(await r.json()) }).catch(() => setMessage('Could not load backtest settings. Check the backend and database setup.')) }, [])
  async function save(report: ReportSettings, form: HTMLFormElement) {
    setSaving(report.id); setMessage('')
    try {
      const file = files[report.id]
      if (file && (file.size > 5 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.pdf'))) throw new Error('Choose a PDF up to 5 MB.')
      const pdf = file ? await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read the PDF.')); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.readAsDataURL(file) }) : undefined
      const response = await fetch(`${reportsBase}/${report.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ price: report.price, discount: report.discount, pdf }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save report.')
      setReports(current => current.map(item => item.id === report.id ? { ...report, hasPdf: report.hasPdf || !!file } : item))
      setFiles(current => ({ ...current, [report.id]: undefined }))
      const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]'); if (fileInput) fileInput.value = ''
      setMessage(`${reportTitles[report.id - 1]} saved.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save report.') } finally { setSaving(null) }
  }
  return <section className="mt-5 rounded-2xl border border-[#e1e8df] bg-white p-5">
    <h2 className="text-xl font-black">Backtest reports</h2>
    <p className="mt-2 text-sm text-[#52645a]">Update prices, discounts and PDFs. A separate admin key protects these changes.</p>
    <label className="mt-4 grid max-w-md gap-1 text-sm font-semibold">Backtest admin key<input type="password" autoComplete="off" value={key} onChange={e => setKey(e.target.value)} className="rounded-xl border border-[#d9e3d9] px-3 py-2" /></label>
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
    <div className="mt-4 grid gap-4 md:grid-cols-3">{reports.map(report => <form key={report.id} className="grid content-start gap-3 rounded-xl border border-[#d9e3d9] p-4" onSubmit={e => { e.preventDefault(); void save(report, e.currentTarget) }}>
      <h3 className="font-bold">{reportTitles[report.id - 1]}</h3>
      <label className="grid gap-1 text-sm">Price (₹)<input required type="number" min="0" max="100000000" step="1" value={report.price} onChange={e => setReports(items => items.map(item => item.id === report.id ? { ...item, price: Number(e.target.value) } : item))} className="rounded-lg border p-2" /></label>
      <label className="grid gap-1 text-sm">Discount (%)<input required type="number" min="0" max="100" step="1" value={report.discount} onChange={e => setReports(items => items.map(item => item.id === report.id ? { ...item, discount: Number(e.target.value) } : item))} className="rounded-lg border p-2" /></label>
      <p className="text-sm">Customer pays {rupees(reportPrice(report))}</p>
      <label className="grid gap-1 text-sm">Replace PDF (max 5 MB)<input type="file" accept="application/pdf,.pdf" onChange={e => setFiles(current => ({ ...current, [report.id]: e.target.files?.[0] }))} className="w-full text-xs" /></label>
      <button disabled={!key || saving !== null} className="rounded-xl bg-[#1c7c55] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving === report.id ? 'Saving…' : 'Save report'}</button>
    </form>)}</div>
  </section>
}
