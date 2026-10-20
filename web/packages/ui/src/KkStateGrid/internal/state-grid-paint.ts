import type { CSSObject } from '@mui/material/styles';

export const STATE_GRID_COLUMNS = '--kk-state-grid-columns';

const DATE_COLUMN = '3.25rem';
const EVENT_COLUMN = 'minmax(15rem, 2.2fr)';
const COMPACT_EVENT_COLUMN = 'minmax(0, 1fr)';
const COUNT_COLUMN = '3.25rem';
const STATUS_COLUMN = 'minmax(0, 1fr)';
const COMPACT_STATUS_COLUMN = '2.75rem';

export const stateGridColumnsOf = (statusColumns: number, compact: boolean): string =>
  [
    DATE_COLUMN,
    compact ? COMPACT_EVENT_COLUMN : EVENT_COLUMN,
    COUNT_COLUMN,
    `repeat(${Math.max(statusColumns, 1)}, ${compact ? COMPACT_STATUS_COLUMN : STATUS_COLUMN})`,
  ].join(' ');

export const stateGridLine: CSSObject = {
  display: 'grid',
  gridTemplateColumns: `var(${STATE_GRID_COLUMNS})`,
  columnGap: 1.5,
  minWidth: 0,
};
