import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { safeAreaInset } from '../../../internal/safe-area';
import { TRACK_SIDE_BLEED, trackEdgeOf } from '../../../KkShell/internal/track-edge';
import { kkTokens } from '../../../tokens';
import { SS_WIDE } from '../ss-wide';

interface KkSsFrameRootProps extends PropsWithChildren {
  label: string;
}

const {
  head,
  pictureMin,
  timeline,
  transport,
  taskMin,
  foot,
  wideTimeline,
  widePictureMin,
  zoneGap,
  playerGap,
  inset,
  columnGap,
} = kkTokens.setupFrame;

const VIDEO_HEIGHT_SHARE = '9 / 16';
const WIDE_PICTURE_SHARE = '2 / 3';

const footRowOf = (theme: Theme): string =>
  `minmax(calc(${theme.spacing(foot)} + ${safeAreaInset('bottom')}), auto)`;

const phonePictureOf = (theme: Theme): string =>
  `minmax(${theme.spacing(pictureMin)}, calc((100cqw - ${theme.spacing(inset * 2)}) * ${VIDEO_HEIGHT_SHARE}))`;

const widePictureOf = (theme: Theme): string =>
  `minmax(${theme.spacing(widePictureMin)}, calc(((100cqw - ${theme.spacing(columnGap)}) * ${WIDE_PICTURE_SHARE} - ${theme.spacing(inset)}) * ${VIDEO_HEIGHT_SHARE}))`;

const phoneRowsOf = (theme: Theme): string =>
  [
    theme.spacing(head),
    phonePictureOf(theme),
    theme.spacing(timeline),
    theme.spacing(transport + playerGap - zoneGap),
    `minmax(${theme.spacing(taskMin)}, 1fr)`,
    footRowOf(theme),
  ].join(' ');

const wideRowsOf = (theme: Theme): string =>
  [
    theme.spacing(head),
    widePictureOf(theme),
    theme.spacing(wideTimeline),
    theme.spacing(transport),
    'minmax(0, 1fr)',
    footRowOf(theme),
  ].join(' ');

export const KkSsFrameRoot: FC<KkSsFrameRootProps> = ({ label, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-ss-frame
    sx={{
      ...TRACK_SIDE_BLEED,
      minWidth: 0,
      height: `calc(100dvh - ${trackEdgeOf('top')})`,
      marginBottom: `calc(-1 * ${trackEdgeOf('bottom')})`,
      containerType: 'size',
      containerName: 'kk-ss',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation',
    }}
  >
    <Box
      sx={(theme) => ({
        display: 'grid',
        width: '100%',
        height: '100%',
        rowGap: zoneGap,
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateAreas: '"head" "picture" "timeline" "transport" "task" "foot"',
        gridTemplateRows: phoneRowsOf(theme),
        [SS_WIDE]: {
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gridTemplateAreas:
            '"head head" "picture task" "timeline task" "transport task" ". task" ". foot"',
          gridTemplateRows: wideRowsOf(theme),
          columnGap,
        },
      })}
    >
      {children}
    </Box>
  </Box>
);
