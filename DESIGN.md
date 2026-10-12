---
name: DECAY HUNTERS Tracker
description: An exchange-close report for reviewing portfolio performance by strategy and trading day.
colors:
  ground: "#f1f3f0"
  surface: "#ffffff"
  ink: "#19272d"
  muted: "#617176"
  rule: "#dce3e1"
  accent: "#137b80"
  positive: "#16795d"
  negative: "#b64b48"
  action: "#1c7c55"
  sidebar: "#14212a"
  navigation-selected: "#203d43"
  navigation-active: "#8de0c3"
  date-signal: "#91651b"
  date-signal-ground: "#f7efd9"
  filter-ground: "#ecf6f3"
  filter-text: "#176b70"
  filter-rule: "#a9d1c9"
  status: "#176b49"
  status-ground: "#e9f5ed"
  status-indicator: "#21875d"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "inherit"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
components:
  report-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "clamp(1rem, 2vw, 1.5rem)"
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.surface}"
    width: "clamp(17rem, 20vw, 20rem)"
  date-range-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  action-button:
    backgroundColor: "{colors.action}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
    height: "2.75rem"
  weekday-chip-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "2rem"
    width: "2rem"
  weekday-chip:
    backgroundColor: "{colors.filter-ground}"
    textColor: "{colors.filter-text}"
    rounded: "{rounded.pill}"
    height: "2rem"
    width: "2rem"
  status-badge:
    backgroundColor: "{colors.status-ground}"
    textColor: "{colors.status}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 0.75rem"
  lot-select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "2.75rem"
---

# Design System: DECAY HUNTERS Tracker

## Overview

**Creative North Star: "The Exchange Close Report"**

The public tracker follows the rhythm of an exchange-close report: the header leads directly into the daily strategy breakdown, where scheduled days, lot size, capital, and period results sit side by side.

Mineral paper and deep ink keep the page quiet while the data leads. Archivo headings, tabular IBM Plex Mono values, teal controls, green and red performance signals, and a restrained amber report-date marker distinguish structure and state. This visual system is scoped to the public tracker and preserves the production feed as its source of figures.

**Key Characteristics:**
- Daily strategy breakdown leads; supporting charts and summaries follow.
- Mineral paper, deep ink navigation, teal selection, green/red P&L, and an amber date marker.
- Archivo headings pair with tabular IBM Plex Mono financial values.
- Strategy, lot, date, weekday, chart, and summary behavior remains data-driven.

## Colors

Mineral Teal handles selected filter states, focus, and the cumulative chart. Amber is reserved for the report-date icon chip. Green and red distinguish P&L direction; the contact action and EOD badge use supporting greens. The deep navigation rail has a dark selected surface with a pale mint edge.

### Primary
- **Mineral Teal:** The active weekday filter, focus outline, and cumulative P&L line.

### Secondary
- **Amber Date Signal:** The small report-date icon chip, paired with its pale amber ground.
- **Strategy Green:** The contact action and positive P&L figures.

### Tertiary
- **Profit and Loss Signals:** Green marks positive values; vermilion marks negative values. Keep both restrained and tied to performance.

### Neutral
- **Mineral Paper:** The page ground behind white report surfaces.
- **Report White:** Main panels, controls, and cards.
- **Deep Ink:** Primary text and the fixed strategy rail.
- **Muted Slate:** Secondary labels and explanatory copy.
- **Fine Rule:** Table dividers, panel borders, and section boundaries.

**The Signal Roles Rule.** Teal marks selection and focus, green and red carry P&L direction, and amber stays with the report date.

## Typography

- **Display Font:** Archivo, sans-serif
- **Body Font:** Inherited from the surrounding application
- **Label/Mono Font:** IBM Plex Mono, ui-monospace, monospace

**Character:** Archivo gives report headings a compact, assertive voice. IBM Plex Mono keeps currency and percentages aligned; body copy stays with the application font.

### Hierarchy
- **Display:** Archivo at 700; the report title scales from 1.5rem to 1.875rem across the small and larger heading styles.
- **Headline:** Archivo at 700, 1.45rem for the daily breakdown and 1.125rem for supporting chart titles.
- **Body:** Inherited application font, normally 1rem with 1.5 line height for explanatory copy.
- **Label:** Table headings use 11px uppercase text; supporting labels remain quiet and legible.
- **Financial data:** IBM Plex Mono with tabular lining numerals; size follows its report context.

**The Number Rule.** Financial values use IBM Plex Mono and tabular numerals so columns stay aligned.

## Layout

The report uses a fluid main column with a 1720px maximum width. At 1024px and wider, a fixed strategy rail sits beside it; below that, the rail becomes an accessible compact menu. The rail width follows a clamp from 17rem to 20rem.

The report header leads into the daily breakdown. At 1280px and wider, the strategy rows become an aligned table. Below 1280px they become stacked rows with weekday context, lot selector, capital, and P&L kept together. Chart and summary grids adapt to available width, and the page avoids horizontal overflow.

## Elevation & Depth

Resting report panels stay flat and use fine neutral borders. Soft shadows lift the calendar popover, chart tooltip, and compact strategy menu above the report. The selected strategy is marked with a tinted surface and a narrow inset edge.

**The Flat Surface Rule.** Keep report panels flat; reserve soft lift for overlays and the compact strategy menu.

## Shapes

Major report panels use 20px corners. Controls and selects use smaller 8px to 12px corners. Weekday markers and the EOD status remain compact circles or pills; use those silhouettes for state labels only.

## Components

- **Strategy rail:** Fixed on wide screens, populated from active API strategies, with a pale edge on the selected row. Compact screens use a separate menu control.
- **Date range:** Pair the current report date and selected range in one control; keep the amber signal on the calendar icon chip.
- **EOD status:** A compact green badge sits alongside the date control.
- **Weekday filter:** Place the filter beside the daily breakdown heading. Selected weekdays use teal; unselected days use a pale teal surface.
- **Daily breakdown:** Keep capital, lot, daily P&L, and monthly P&L aligned. Use a table on wide screens and readable strategy rows on narrow screens.
- **Lot selector:** Keep the selector next to its strategy and apply the multiplier consistently to displayed capital and P&L.
- **Panels and charts:** Use flat white report surfaces with restrained borders; reserve shadows for floating controls.

## Do's and Don'ts

### Do:
- **Do** keep every report value readable at narrow widths and preserve its source data.
- **Do** use the selected date range, weekday filters, and lot sizes consistently across the report.
- **Do** retain loading, error, and empty states for the production API.
- **Do** keep financial figures tabular and strategy rows data-driven.

### Don't:
- **Don't** hardcode strategy rows, performance claims, or placeholder metrics into the live tracker.
- **Don't** use heavy shadows, decorative gradients, or extra color accents that compete with the data.
