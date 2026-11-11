import type { CSSObject } from '@mui/material/styles';

export const COVERAGE_GRID_COLUMNS = '--kk-coverage-grid-columns';

const HEAD_COLUMN = 'minmax(6rem, 1fr)';
const MARK_COLUMN = '1.375rem';

export const coverageGridColumnsOf = (markColumnCount: number): string =>
  `${HEAD_COLUMN} repeat(${Math.max(markColumnCount, 1)}, ${MARK_COLUMN})`;

export const coverageGridLine: CSSObject = {
  display: 'grid',
  gridTemplateColumns: `var(${COVERAGE_GRID_COLUMNS})`,
  columnGap: 0.25,
  alignItems: 'center',
  minWidth: 0,
};
