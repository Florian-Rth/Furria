import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import type { BeerHubSummary } from '@/features/manage-beer-list/beer-hub';
import { dayKeyOf, dayMonthOfKey } from '@/features/manage-beer-list/beer-time';
import type { BeerMovement } from '@/features/manage-beer-list/schemas';
import type { LabStockState } from './schemas';
import { LabStockStateSchema } from './schemas';

const DAY_MS = 86_400_000;
const WARN_WITHIN_DAYS = 7;
const RUNWAY_WEEKS = 4;

export const STOCK_CHART_LAB_TITLE = 'Bestandskurve';
export const STOCK_CHART_LAB_LEAD = 'Drei Entwürfe für die Kurve im Kopf der Bierliste';
export const STATE_CHOICE_LABEL = 'Lage erzwingen';

export const STATE_CHOICES: readonly KkChoiceChip[] = [
  { id: 'real', label: 'Echt' },
  { id: 'warn', label: 'Warnung' },
  { id: 'still', label: 'kein Tempo' },
  { id: 'long', label: 'lange Reichweite' },
];

export type StockChartVariant = 'current' | 'curve' | 'bars' | 'runway';

export const VARIANT_ORDER: readonly StockChartVariant[] = ['current', 'curve', 'bars', 'runway'];

export const NO_POT_TITLE = 'Keine offene Bierliste';
export const NO_POT_TEXT = 'Ohne offene Liste gibt es keinen Bestand zum Zeichnen.';

export const VARIANT_TITLES: Readonly<Record<StockChartVariant, string>> = {
  current: 'Heute',
  curve: 'A · Verlauf',
  bars: 'B · Tagessäulen',
  runway: 'C · Reichweite',
};

const FORCED_DAYS: Readonly<Record<Exclude<LabStockState, 'real' | 'still'>, number>> = {
  warn: 5,
  long: 60,
};

export const labStockStateOf = (id: string): LabStockState | null => {
  const parsed = LabStockStateSchema.safeParse(id);

  return parsed.success ? parsed.data : null;
};

export const labSummaryOf = (
  summary: BeerHubSummary,
  state: LabStockState,
  now: string,
): BeerHubSummary => {
  if (state === 'real') {
    return summary;
  }
  if (state === 'still') {
    return { ...summary, emptyOn: null, daysLeft: null, warns: false };
  }

  const daysLeft = FORCED_DAYS[state];

  return {
    ...summary,
    emptyOn: dayKeyOf(new Date(Date.parse(now) + daysLeft * DAY_MS).toISOString()),
    daysLeft,
    warns: daysLeft <= WARN_WITHIN_DAYS,
  };
};

const restocks = (movement: BeerMovement): boolean =>
  movement.crates > 0 && (movement.kind === 'delivery' || movement.kind === 'handoverCarry');

export const deliveriesOf = (
  movements: readonly BeerMovement[],
  now: string,
  days: number,
): readonly number[] => {
  const end = Date.parse(now);

  return Array.from({ length: days }, (_, index) => {
    const until = end - (days - 1 - index) * DAY_MS;
    const since = until - DAY_MS;

    return movements
      .filter(restocks)
      .filter((movement) => {
        const at = Date.parse(movement.bookedAt);

        return at > since && at <= until;
      })
      .reduce((sum, movement) => sum + movement.crates, 0);
  });
};

export interface RunwayReadout {
  value: string;
  unit: string;
}

export const runwayReadoutOf = (summary: BeerHubSummary): RunwayReadout => {
  if (summary.daysLeft === null || summary.stock <= 0) {
    return { value: '—', unit: 'kein Verbrauch' };
  }

  const days = Math.round(summary.daysLeft);

  return { value: String(days), unit: days === 1 ? 'Tag übrig' : 'Tage übrig' };
};

export interface RunwayLabels {
  now: string;
  empty: string | null;
  scale: string;
  beyond: string;
}

export const runwayLabelsOf = (summary: BeerHubSummary): RunwayLabels => ({
  now: 'heute',
  empty: summary.emptyOn === null ? null : dayMonthOfKey(summary.emptyOn),
  scale: `${RUNWAY_WEEKS} Wo.`,
  beyond: `über ${RUNWAY_WEEKS} Wo.`,
});
