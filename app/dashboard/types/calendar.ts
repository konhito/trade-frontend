import { Trade } from "@/lib/types";

export interface CalendarEntry {
  pnl: number;
  tradeNumber: number;
  longNumber: number;
  shortNumber: number;
  trades: Trade[];
  strategies?: string[];
}

export interface CalendarData {
  [date: string]: CalendarEntry;
}
