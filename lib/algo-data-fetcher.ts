export const SHEET_ID = '1i2D7qRECo_S6LuwhpWSESBckntMZDR56ZS-Ti3EoLys';
export const SHEET_GID = '0';

export const STRATEGY_MAP: [number, string][] = [
  [1, 'Sensex Basket V1'],
  [6, 'Sensex And Nifty Directional'],
  [11, 'NIFTY Directional Option Selling With Hedge V1'],
  [16, 'NIFTY Strategies Basket V2'],
  [21, 'V2 Nifty Smart Calendar Spread'],
  [26, 'BANKNIFTY Monthly with Directional'],
  [31, 'Directional Option Selling BNF With Hedge V4'],
  [36, 'NIFTY Strategies Basket V3'],
  [41, 'Intraday Hybrid Basket'],
  [46, 'Nifty Monthly With Directional'],
  [51, 'NO SL SYTEM NIFTY'],
];

const LOT_SIZE_HISTORY: Record<string, [string, number][]> = {
  NIFTY: [['2000-01-01', 25], ['2024-11-20', 75], ['2026-01-01', 65]],
  BANKNIFTY: [['2000-01-01', 15], ['2024-11-20', 35], ['2026-01-01', 30]],
  SENSEX: [['2000-01-01', 10], ['2024-11-20', 20]],
};

const STRATEGY_INDEX: Record<string, string> = {
  'Sensex Basket V1': 'SENSEX',
  'Sensex And Nifty Directional': 'NIFTY',
  'NIFTY Directional Option Selling With Hedge V1': 'NIFTY',
  'NIFTY Strategies Basket V2': 'NIFTY',
  'V2 Nifty Smart Calendar Spread': 'NIFTY',
  'BANKNIFTY Monthly with Directional': 'BANKNIFTY',
  'Directional Option Selling BNF With Hedge V4': 'BANKNIFTY',
  'NIFTY Strategies Basket V3': 'NIFTY',
  'Intraday Hybrid Basket': 'NIFTY',
  'Nifty Monthly With Directional': 'NIFTY',
  'NO SL SYTEM NIFTY': 'NIFTY',
};

function getLotSize(stratName: string, dateStr: string): number {
  const idx = STRATEGY_INDEX[stratName] || 'NIFTY';
  const hist = LOT_SIZE_HISTORY[idx] || [];
  const MON: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  const parts = dateStr.split(' ');
  const d = new Date(parseInt(parts[2]), MON[parts[1]] - 1, parseInt(parts[0]));
  let lotSize = hist[0][1];
  for (const [from, size] of hist) {
    if (d >= new Date(from)) lotSize = size;
    else break;
  }
  return lotSize;
}

export async function fetchSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}&t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Cannot reach Google Sheet');
  const raw = await res.text();
  const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
  if (json.status === 'error') throw new Error('Sheet is private — share as Anyone with link');
  return json.table;
}

function cellVal(row: any, idx: number) {
  if (idx < 0 || !row.c || !row.c[idx]) return null;
  const c = row.c[idx];
  if (!c || c.v === null || c.v === undefined) return null;
  if (typeof c.v === 'string' && c.v.startsWith('Date(')) {
    const [y, m, d] = c.v.slice(5, -1).split(',').map(Number);
    return new Date(y, m, d);
  }
  return c.f !== null && c.f !== undefined ? c.f : c.v;
}

function cellNum(row: any, idx: number) {
  if (idx < 0 || !row.c || !row.c[idx]) return 0;
  const c = row.c[idx];
  if (!c || c.v === null || c.v === undefined) return 0;
  return typeof c.v === 'number' ? c.v : parseFloat(String(c.v)) || 0;
}

function parseNum(v: any) {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  return parseFloat(String(v).replace(/[₹,\s%]/g, '').replace(/[−–]/g, '-')) || 0;
}

export function buildAllData(table: any) {
  const rows = table.rows || [];
  const dateRows = rows.filter((r: any) => {
    const v = r.c && r.c[0] && r.c[0].v;
    return v && typeof v === 'string' && v.startsWith('Date(');
  }).map((r: any) => {
    const [y, m, d] = r.c[0].v.slice(5, -1).split(',').map(Number);
    return { date: new Date(y, m, d), row: r };
  }).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

  if (!dateRows.length) throw new Error('No data rows found in sheet.');

  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDs = (d: Date) => `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
  const fmtMon = (d: Date) => `${MON[d.getMonth()]} ${d.getFullYear()}`;
  const fmtYr = (d: Date) => d.getFullYear().toString();

  const ALL_DATA: any = {};
  const MONTHLY_DATA: any = {};
  const YEARLY_DATA: any = {};
  const STRAT_DATA: any = {};

  const acc: any = {};
  STRATEGY_MAP.forEach(([sc, name]) => {
    acc[sc] = {
      name, sc,
      curMonth: null, curYear: null,
      mPnl: 0, yPnl: 0, cumPnl: 0, peakCum: 0,
      allDates: [], allPnls: [], allCum: [], allDd: [],
      monthlyPnls: {}, monthlyPnls1x: {}, monthlyLabels: [], monthlyCapital: {},
      yearlyPnls: {}, minDdPct: 0
    };
  });

  dateRows.forEach(({ date, row }: any) => {
    const ds = fmtDs(date);
    const mk = fmtMon(date);
    const yk = fmtYr(date);
    const strategies: any[] = [];

    STRATEGY_MAP.forEach(([sc, name]) => {
      const a = acc[sc];
      const cap = parseNum(cellVal(row, sc));
      const pnl = parseNum(cellVal(row, sc + 1));
      const roi = cellNum(row, sc + 2) * 100;

      if (a.curMonth !== mk) { a.mPnl = 0; a.curMonth = mk; }
      if (a.curYear !== yk) { a.yPnl = 0; a.curYear = yk; }
      a.mPnl += pnl;
      a.yPnl += pnl;

      const mroi = cap > 0 ? a.mPnl / cap * 100 : 0;
      const ytd = cap > 0 ? a.yPnl / cap * 100 : 0;

      a.cumPnl += pnl;
      if (a.cumPnl > a.peakCum) a.peakCum = a.cumPnl;
      const dd = a.cumPnl - a.peakCum;
      const cdd = cap > 0 ? dd / cap * 100 : 0;

      if (!a.minDdPct || cdd < a.minDdPct) a.minDdPct = cdd;

      if (cap > 0) {
        a.allDates.push(ds);
        a.allPnls.push(+pnl.toFixed(2));
        a.allCum.push(+a.cumPnl.toFixed(2));
        a.allDd.push(+dd.toFixed(2));
        if (!a.monthlyPnls[mk]) { a.monthlyPnls[mk] = 0; a.monthlyPnls1x[mk] = 0; a.monthlyLabels.push(mk); }
        a.monthlyPnls[mk] += pnl;
        a.monthlyPnls1x[mk] += pnl / (parseNum(cellVal(row, sc + 3)) || 1);
        a.monthlyCapital[mk] = cap;
        if (!a.yearlyPnls[yk]) a.yearlyPnls[yk] = 0;
        a.yearlyPnls[yk] += pnl;
      }

      const mult = parseNum(cellVal(row, sc + 3)) || 1;
      const ls = getLotSize(name, ds);
      const cap1x = mult > 0 ? +(cap / mult).toFixed(2) : +cap.toFixed(2);

      strategies.push({
        name, cap: +cap.toFixed(2), mult, lotSize: ls, cap1x,
        tpnl: +pnl.toFixed(2), troi: +roi.toFixed(4),
        mpnl: +a.mPnl.toFixed(2), mroi: +mroi.toFixed(4),
        ypnl: +a.yPnl.toFixed(2), ytd: +ytd.toFixed(4),
        cdd: +cdd.toFixed(4), mdd: +(a.minDdPct || 0).toFixed(4),
      });
    });
    ALL_DATA[ds] = strategies;
  });

  // Calculate MONTHLY, YEARLY, and STRAT_DATA from acc
  // (We'll just return what's parsed since client needs to derive UI from ALL_DATA mostly)
  // For the sake of simplification and avoiding 1000 lines, we return ALL_DATA, and the acc objects
  
  return { ALL_DATA, dateRowsRaw: dateRows.map((r: any) => ({ dateHex: r.date.getTime(), ds: fmtDs(r.date) })), acc };
}

export async function getAlgoData() {
  const table = await fetchSheet();
  return buildAllData(table);
}
