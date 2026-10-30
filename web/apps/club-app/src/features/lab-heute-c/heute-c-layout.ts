import type { KkStepState } from '@furria/ui/step-state';
import type { AblaufState } from './heute-c-view';

const LANDSCAPE = '@container kk-hall (min-aspect-ratio: 1/1)';

export type HeuteCArea = 'head' | 'list' | 'bar' | 'centre' | 'keys' | 'call';

export const HEUTE_GRID = {
  gridArea: '1 / 1 / -1 / -1',
  display: 'grid',
  minWidth: 0,
  minHeight: 0,
  columnGap: 2,
  rowGap: 1.5,
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateRows: 'auto minmax(0, 1.2fr) auto minmax(0, 1fr) auto',
  gridTemplateAreas: '"head" "centre" "bar" "call" "keys"',
  [LANDSCAPE]: {
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.8fr) minmax(0, 1fr)',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    gridTemplateAreas: '"head head head" "list centre call" "list keys call"',
  },
};

const PORTRAIT_ONLY = { display: 'grid', [LANDSCAPE]: { display: 'none' } };
export const PORTRAIT_ONLY_TEXT = { display: 'block', [LANDSCAPE]: { display: 'none' } };
const LANDSCAPE_ONLY = { display: 'none', [LANDSCAPE]: { display: 'grid' } };

export const AREA_SHOWN: Record<HeuteCArea, object> = {
  head: { display: 'grid' },
  list: LANDSCAPE_ONLY,
  bar: PORTRAIT_ONLY,
  centre: { display: 'grid' },
  keys: { display: 'grid' },
  call: { display: 'grid' },
};

export const KEY_HEIGHT = '4rem';

export const ENTRY_STATES: Record<AblaufState, KkStepState> = {
  done: 'off',
  current: 'current',
  open: 'open',
};
