import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import DirectionsWalkRoundedIcon from '@mui/icons-material/DirectionsWalkRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import type { ComponentType, FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { LANE_KEY_WIDTH } from '../lane-sizes';
import type { KkTimelineLaneKind, KkTimelineLaneLabels, KkTimelineRows } from '../timeline-paint';
import { LANE_PLACES, shownLanesOf } from '../timeline-paint';

const LANE_ICONS: Readonly<Record<KkTimelineLaneKind, ComponentType<SvgIconProps> | null>> = {
  ruler: null,
  parts: BookmarkBorderRoundedIcon,
  wave: MusicNoteRoundedIcon,
  steps: DirectionsWalkRoundedIcon,
  videos: VideocamRoundedIcon,
  keys: RouteRoundedIcon,
};

const RULER_LINE = {
  borderBottomWidth: kkTokens.line.hair,
  borderBottomStyle: 'solid',
  borderBottomColor: 'divider',
} as const;

const SETUP_SCALE = '[data-kk-timeline-scale="setup"] &';
const SETUP_ICON = '1rem';

interface KkTimelineLaneKeysProps {
  rows: KkTimelineRows;
  labels: KkTimelineLaneLabels;
  focus?: KkTimelineLaneKind | null;
  sx?: KkSx;
}

export const KkTimelineLaneKeys: FC<KkTimelineLaneKeysProps> = ({
  rows,
  labels,
  focus = null,
  sx,
}) => {
  const keys = shownLanesOf(rows).map((kind) => {
    const Icon = LANE_ICONS[kind];
    const icon =
      Icon === null ? null : (
        <Icon fontSize="small" sx={{ [SETUP_SCALE]: { width: SETUP_ICON, height: SETUP_ICON } }} />
      );
    const name =
      Icon === null ? null : (
        <Typography
          variant="caption"
          noWrap
          sx={{ display: { xs: 'none', desktop: 'block' }, color: 'inherit' }}
        >
          {labels[kind]}
        </Typography>
      );

    return (
      <Stack
        key={kind}
        direction="row"
        data-kk-timeline-lane-key={kind}
        data-focus={kind === focus}
        title={labels[kind]}
        style={LANE_PLACES[kind]}
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: { xs: 'center', desktop: 'flex-start' },
          gap: 0.5,
          px: { xs: 0, desktop: 1 },
          color: 'text.secondary',
          ...(kind === 'ruler' ? RULER_LINE : {}),
          '&[data-focus="true"]': {
            color: 'text.primary',
            backgroundColor: inkWash(theme, '9%'),
          },
        })}
      >
        {icon}
        {name}
      </Stack>
    );
  });

  return (
    <Box
      aria-hidden
      data-kk-timeline-lane-keys
      sx={[
        {
          position: 'relative',
          flexShrink: 0,
          width: LANE_KEY_WIDTH,
          borderRightWidth: kkTokens.line.hair,
          borderRightStyle: 'solid',
          borderRightColor: 'divider',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {keys}
    </Box>
  );
};
