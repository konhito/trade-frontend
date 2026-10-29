import { trackerApiBase } from '@/lib/public-tracker'

export const reportsBase = `${trackerApiBase}/backtest-reports`
export const reportTitles = ['₹5 LAKH | INTRADAY + STBT – STARTER', '₹10 LAKH | INTRADAY + STBT – STANDARD', '₹15 LAKH | INTRADAY + STBT – ADVANCED']
export type ReportSettings = { id: number; price: number; discount: number; hasPdf: boolean }
export const reportPrice = (report: ReportSettings) => Math.round(report.price * (100 - report.discount) / 100)
export const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`
