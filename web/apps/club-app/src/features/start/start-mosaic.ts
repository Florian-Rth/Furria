import { tileFactsOf } from './mine-tile';
import type { Start, StartPanel } from './schemas';

export type TileKind = StartPanel['kind'];

export interface TileSpan {
  xs: number;
  md: number;
}

export interface MosaicTile {
  kind: TileKind;
  order: number;
  span: TileSpan;
  shownCount: number | null;
}

export interface Mosaic {
  lead: MosaicTile | null;
  side: MosaicTile[];
  sideSpan: TileSpan;
  rest: MosaicTile[];
}

const LEAD_KIND: TileKind = 'calendar';
const FIRST_TILE_ORDER = 1;
const FULL = 12;
const HALF = 6;
const THIRD = 4;
const WIDE_LEAD = 8;
const NARROW_SIDE = 4;
const LIGHT_SIDE_SHARE = 0.7;
const ROW_OF_THIRDS = 3;
const ROW_OF_HALVES = 2;
const TWO_ROWS_OF_HALVES = 4;
const HEAD_WEIGHT = 1;
const LEAD_ENTRY_WEIGHT = 2;
const ROW_WEIGHT = 1.1;
const AUTHOR_WEIGHT = 0.8;
const COUNTERS_PER_ROW = 5;
const NARROW_COUNTERS_PER_ROW = 3;
const MIN_CALENDAR_ROWS = 2;
const COUNTER_ROW_WEIGHT = 1.4;
const JUBILEE_WEIGHT = 1.3;
const COVERS_WEIGHT = 3;
const FURTHER_WEIGHT = 0.4;

const shownOf = (count: number, cap: number): number => Math.min(count, cap);

const furtherOf = (count: number, cap: number): number => (count > cap ? FURTHER_WEIGHT : 0);

const distinctAuthorCount = (panel: StartPanel & { kind: 'announcements' }): number =>
  new Set(
    panel.announcements
      .slice(0, panel.shownCount)
      .map((announcement) => announcement.author?.personId ?? null),
  ).size;

export const weightOf = (panel: StartPanel, countersPerRow: number = COUNTERS_PER_ROW): number => {
  if (panel.kind === 'calendar') {
    const rows = Math.max(0, shownOf(panel.entries.length, panel.shownCount) - 1);

    return (
      HEAD_WEIGHT +
      LEAD_ENTRY_WEIGHT +
      rows * ROW_WEIGHT +
      furtherOf(panel.entries.length, panel.shownCount)
    );
  }
  if (panel.kind === 'announcements') {
    return (
      HEAD_WEIGHT +
      distinctAuthorCount(panel) * AUTHOR_WEIGHT +
      shownOf(panel.announcements.length, panel.shownCount) * ROW_WEIGHT +
      furtherOf(panel.announcements.length, panel.shownCount)
    );
  }
  if (panel.kind === 'mine') {
    const facts = tileFactsOf(panel.mine).length;

    return HEAD_WEIGHT + shownOf(facts, panel.shownCount) * ROW_WEIGHT;
  }
  if (panel.kind === 'toDos') {
    return HEAD_WEIGHT + Math.ceil(panel.toDos.length / countersPerRow) * COUNTER_ROW_WEIGHT;
  }
  if (panel.kind === 'groups') {
    return HEAD_WEIGHT + shownOf(panel.groupMoments.length, panel.shownCount) * JUBILEE_WEIGHT;
  }

  return HEAD_WEIGHT + COVERS_WEIGHT + ROW_WEIGHT;
};

const hasTileContent = (panel: StartPanel): boolean =>
  panel.kind !== 'mine' || tileFactsOf(panel.mine).length > 0;

export const restSpansOf = (count: number): number[] => {
  if (count === 1) {
    return [FULL];
  }

  const remainder = count % ROW_OF_THIRDS;

  if (remainder === 0) {
    return Array.from({ length: count }, () => THIRD);
  }

  const halves = remainder === 1 ? TWO_ROWS_OF_HALVES : ROW_OF_HALVES;
  const thirds = count - halves;

  return [
    ...Array.from({ length: thirds }, () => THIRD),
    ...Array.from({ length: halves }, () => HALF),
  ];
};

const sideCountOf = (lead: StartPanel, others: readonly StartPanel[]): number => {
  const goal = weightOf(lead);
  let filled = 0;
  let taken = 0;

  for (const panel of others) {
    if (filled >= goal) {
      break;
    }

    filled += weightOf(panel);
    taken += 1;
  }

  return taken;
};

export const fittedCalendarCount = (
  calendar: StartPanel & { kind: 'calendar' },
  sideWeight: number,
): number => {
  const shown = shownOf(calendar.entries.length, calendar.shownCount);
  const rowRoom =
    sideWeight -
    HEAD_WEIGHT -
    LEAD_ENTRY_WEIGHT -
    (calendar.entries.length > MIN_CALENDAR_ROWS + 1 ? FURTHER_WEIGHT : 0);
  const rows = Math.max(MIN_CALENDAR_ROWS, Math.floor(rowRoom / ROW_WEIGHT));

  return Math.min(shown, rows + 1);
};

const leadCountOf = (
  lead: StartPanel,
  sidePanels: readonly StartPanel[],
  lightSide: boolean,
): number | null => {
  if (!lightSide || lead.kind !== LEAD_KIND) {
    return null;
  }

  const narrowWeight = sidePanels.reduce(
    (sum, panel) => sum + weightOf(panel, NARROW_COUNTERS_PER_ROW),
    0,
  );

  return fittedCalendarCount(lead, narrowWeight);
};

export const toMosaic = (start: Start): Mosaic => {
  const panels = start.panels.filter(hasTileContent);
  const lead = panels.find((panel) => panel.kind === LEAD_KIND) ?? null;
  const others = panels.filter((panel) => panel.kind !== LEAD_KIND);
  const sideCount = lead === null ? 0 : sideCountOf(lead, others);
  const restPanels = others.slice(sideCount);
  const restSpans = restSpansOf(restPanels.length);
  const firstOrder = lead === null ? FIRST_TILE_ORDER : FIRST_TILE_ORDER + 1;
  const sidePanels = others.slice(0, sideCount);
  const sideWeight = sidePanels.reduce((sum, panel) => sum + weightOf(panel), 0);
  const lightSide = lead !== null && sideWeight < weightOf(lead) * LIGHT_SIDE_SHARE;
  const leadWidth = lightSide ? WIDE_LEAD : HALF;

  return {
    lead:
      lead === null
        ? null
        : {
            kind: LEAD_KIND,
            order: FIRST_TILE_ORDER,
            span: { xs: FULL, md: others.length === 0 ? FULL : leadWidth },
            shownCount: leadCountOf(lead, sidePanels, lightSide),
          },
    sideSpan: { xs: FULL, md: lightSide ? NARROW_SIDE : HALF },
    side: sidePanels.map((panel, index) => ({
      kind: panel.kind,
      order: firstOrder + index,
      span: { xs: FULL, md: FULL },
      shownCount: null,
    })),
    rest: restPanels.map((panel, index) => ({
      kind: panel.kind,
      order: firstOrder + sideCount + index,
      span: { xs: FULL, md: restSpans[index] ?? FULL },
      shownCount: null,
    })),
  };
};
