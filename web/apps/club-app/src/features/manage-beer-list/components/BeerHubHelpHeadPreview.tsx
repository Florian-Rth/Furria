import { KkPourHead } from '@furria/ui/KkPourHead';
import { KkPourStockLines } from '@furria/ui/KkPourStockLines';
import type { KkPourStockLine, KkPourStockLinesLabels } from '@furria/ui/pour-stock-line';
import type { FC } from 'react';
import {
  COUNTERS_LABEL,
  HEAD_LABEL,
  openTabsLabelOf,
  PEOPLE_LABEL,
  STOCK_LABEL,
  STOCK_UNIT,
  tileEuroOf,
} from '../beer-hub-copy';

const SAMPLE_LINES: readonly KkPourStockLine[] = [
  {
    key: 'veltins',
    label: 'Veltins',
    facts: '6 Kisten',
    outlook: 'reicht bis ≈ Sa 06.12.',
    warn: false,
    values: [12, 11, 11, 10, 9, 9, 8, 7, 7, 6],
    forecastDays: 12,
  },
];
const SAMPLE_LABELS: KkPourStockLinesLabels = { from: '15.11.', now: 'heute' };
const SAMPLE_CAPTION = 'Veltins: reicht bis ≈ Sa 06.12.';
const SAMPLE_STOCK = '6';
const SAMPLE_OPEN = tileEuroOf(7200);
const SAMPLE_OPEN_LABEL = openTabsLabelOf(3);
const SAMPLE_PEOPLE = '14';

export const BeerHubHelpHeadPreview: FC = () => {
  const spark = <KkPourStockLines lines={SAMPLE_LINES} labels={SAMPLE_LABELS} />;

  return (
    <KkPourHead label={HEAD_LABEL}>
      <KkPourHead.Stock
        label={STOCK_LABEL}
        value={SAMPLE_STOCK}
        unit={STOCK_UNIT}
        caption={SAMPLE_CAPTION}
        warn={false}
        spark={spark}
      />
      <KkPourHead.Counters label={COUNTERS_LABEL}>
        <KkPourHead.Counter value={SAMPLE_OPEN} label={SAMPLE_OPEN_LABEL} attention={false} />
        <KkPourHead.Counter value={SAMPLE_PEOPLE} label={PEOPLE_LABEL} attention={false} />
      </KkPourHead.Counters>
    </KkPourHead>
  );
};
