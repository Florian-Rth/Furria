import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import {
  TWIN_BAND,
  TWIN_BAND_HEIGHT,
  TWIN_COLUMN,
  TWIN_FRONT,
  TWIN_GAP,
  TWIN_HEIGHT,
  TWIN_OPEN,
  TWIN_STAGE,
  TWIN_TIGHT,
  TWIN_TIGHT_GAP,
  TWIN_VIDEO_ASPECT,
  TWIN_WIDE,
  TWIN_WIDTH,
} from '../twin-query';

const BAND = `var(${TWIN_BAND})`;
const STAGE = `var(${TWIN_STAGE})`;
const STACKED_WIDTH = `min(100cqw, calc((100cqh - ${BAND} - 2 * ${TWIN_GAP} - ${TWIN_FRONT}) / (${1 / TWIN_VIDEO_ASPECT} + 1 / ${STAGE})))`;
const SIDE_HEIGHT = `min(100cqh, calc((100cqw - ${TWIN_COLUMN} - 2 * ${TWIN_GAP} + ${TWIN_FRONT} * ${STAGE}) / (${TWIN_VIDEO_ASPECT} + ${STAGE})))`;
const TIGHT_HEIGHT = `min(calc(100cqh - ${BAND} - ${TWIN_TIGHT_GAP}), calc((100cqw - ${TWIN_TIGHT_GAP} + ${TWIN_FRONT} * ${STAGE}) / (${TWIN_VIDEO_ASPECT} + ${STAGE})))`;
const OPEN_HEIGHT = `min(calc(100cqh - ${BAND} - ${TWIN_GAP}), calc((100cqw - ${TWIN_GAP} + ${TWIN_FRONT} * ${STAGE}) / (${TWIN_VIDEO_ASPECT} + ${STAGE})))`;

interface KkTwinPairProps extends PropsWithChildren {
  stageRatio: number;
}

export const KkTwinPair: FC<KkTwinPairProps> = ({ stageRatio, children }) => (
  <Box
    data-kk-twin-pair
    sx={{
      gridArea: 'pair',
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
      containerType: 'size',
    }}
  >
    <Box
      sx={(theme) => ({
        [TWIN_STAGE]: stageRatio,
        [TWIN_BAND]: TWIN_BAND_HEIGHT.phone,
        [theme.breakpoints.up('desktop')]: { [TWIN_BAND]: TWIN_BAND_HEIGHT.desktop },
        [TWIN_WIDTH]: STACKED_WIDTH,
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateAreas: '"video" "spine" "stage"',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        gap: TWIN_GAP,
        [TWIN_WIDE]: {
          [TWIN_HEIGHT]: SIDE_HEIGHT,
          gridTemplateAreas: '"video spine stage"',
        },
        [TWIN_OPEN]: {
          [TWIN_HEIGHT]: OPEN_HEIGHT,
          gridTemplateAreas: '"video stage" "spine spine"',
        },
        [TWIN_TIGHT]: {
          [TWIN_BAND]: TWIN_BAND_HEIGHT.tight,
          [TWIN_HEIGHT]: TIGHT_HEIGHT,
          gridTemplateAreas: '"video stage" "spine spine"',
          gap: TWIN_TIGHT_GAP,
        },
      })}
    >
      {children}
    </Box>
  </Box>
);
