import type { CSSObject } from '@mui/material/styles';
import { HALL_WIDE } from './hall-query';

export type KkHallLayout = 'wall' | 'thumbs' | 'band';

const THUMB_COLUMN = 'minmax(6rem, 17cqw)';

export const HALL_LAYOUTS: Record<KkHallLayout, CSSObject> = {
  wall: {
    gridTemplateAreas: '"count" "step" "stage" "absent" "keys"',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 22cqh) auto minmax(0, 1fr) auto auto',
    [HALL_WIDE]: {
      gridTemplateAreas: '"count stage" "step stage" "absent stage" "keys keys"',
      gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
      gridTemplateRows: 'minmax(0, 1fr) auto auto auto',
    },
  },
  thumbs: {
    gridTemplateAreas: '"left" "step" "stage" "absent" "right"',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 16cqh) auto minmax(0, 1fr) auto minmax(0, 12cqh)',
    [HALL_WIDE]: {
      gridTemplateAreas: '"left stage right" "left step right" "left absent right"',
      gridTemplateColumns: `${THUMB_COLUMN} minmax(0, 1fr) ${THUMB_COLUMN}`,
      gridTemplateRows: 'minmax(0, 1fr) auto auto',
    },
  },
  band: {
    gridTemplateAreas: '"band" "step" "stage" "absent" "keys"',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 14cqh) auto minmax(0, 1fr) auto auto',
    [HALL_WIDE]: {
      gridTemplateAreas: '"band band" "step stage" "absent stage" "keys keys"',
      gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
      gridTemplateRows: 'minmax(0, 24cqh) minmax(0, 1fr) auto auto',
    },
  },
};
