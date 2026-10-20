import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkIconName } from '../KkIcon';
import { KkIcon } from '../KkIcon';
import { KkStateGlyph } from '../KkStatePill/KkStateGlyph';
import type { KkStepState } from '../KkStatePill/step-state';
import type { KkSx } from '../kk-sx';
import type { KkStateBadgeSize } from './badge-paint';
import {
  BADGE_EXTENTS,
  BADGE_ICON_EXTENTS,
  badgeDiscPaint,
  badgeSelectedPaint,
  CORNER_EXTENTS,
  FLIP_ANIMATION,
} from './badge-paint';
import { useDoneFlip } from './use-done-flip';

const CORNER_SHIFT = '-0.1875rem';

interface KkStateBadgeProps {
  icon: KkIconName;
  state: KkStepState;
  size?: KkStateBadgeSize;
  selected?: boolean;
  sx?: KkSx;
}

export const KkStateBadge: FC<KkStateBadgeProps> = ({
  icon,
  state,
  size = 'medium',
  selected = false,
  sx,
}) => {
  const flips = useDoneFlip(state);
  const extent = BADGE_EXTENTS[size];
  const iconExtent = BADGE_ICON_EXTENTS[size];
  const animation = flips > 0 ? FLIP_ANIMATION : 'none';
  const corner =
    state === 'open' ? null : (
      <Box
        component="span"
        aria-hidden
        sx={{
          position: 'absolute',
          right: CORNER_SHIFT,
          bottom: CORNER_SHIFT,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: CORNER_EXTENTS[size],
          height: CORNER_EXTENTS[size],
          borderRadius: '50%',
          bgcolor: 'background.paper',
        }}
      >
        <KkStateGlyph state={state} sx={{ width: '72%', height: '72%' }} />
      </Box>
    );

  return (
    <Box
      component="span"
      aria-hidden
      data-kk-state-badge={state}
      sx={[
        {
          position: 'relative',
          display: 'inline-flex',
          flexShrink: 0,
          width: extent,
          height: extent,
          perspective: '20rem',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        key={flips}
        component="span"
        sx={[
          {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          },
          (theme) => badgeDiscPaint(theme, state),
          (theme) => badgeSelectedPaint(theme, selected),
        ]}
      >
        <KkIcon name={icon} sx={{ width: iconExtent, height: iconExtent }} />
      </Box>
      {corner}
    </Box>
  );
};
