import Box from '@mui/material/Box';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { STUDIO_G_WIDE } from '../../../KkStudioGDesk/internal/logic/studio-g-desk-queries';
import { kkTokens } from '../../../tokens';
import { LANE_HEIGHTS, SHORT_LANE_HEIGHTS, WIDE_LANE_HEIGHTS } from '../logic/studio-g-lane-kinds';
import type { KkStudioGTimelineGestures } from '../logic/use-timeline-gestures';
import { useTimelineGestures } from '../logic/use-timeline-gestures';

const SHORT = '@container kk-studio-g (max-height: 38rem)';
const HEADS = { xs: '2.25rem', wide: '6.75rem' };

interface KkStudioGTimelineRootProps extends PropsWithChildren {
  label: string;
  heads: ReactNode;
  gestures: KkStudioGTimelineGestures;
}

export const KkStudioGTimelineRoot: FC<KkStudioGTimelineRootProps> = ({
  label,
  heads,
  gestures,
  children,
}) => {
  const surface = useTimelineGestures(gestures);

  return (
    <Box
      role="group"
      aria-label={label}
      data-kk-studio-g-timeline-box
      sx={(theme) => ({
        ...LANE_HEIGHTS,
        [SHORT]: SHORT_LANE_HEIGHTS,
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `${HEADS.xs} minmax(0, 1fr)`,
        minWidth: 0,
        py: 0.5,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
        '& [data-kk-studio-g-head-label]': { display: 'none' },
        [STUDIO_G_WIDE]: {
          ...WIDE_LANE_HEIGHTS,
          gridTemplateColumns: `${HEADS.wide} minmax(0, 1fr)`,
          '& [data-kk-studio-g-head-label]': { display: 'block' },
        },
      })}
    >
      <Box
        data-kk-studio-g-heads
        sx={(theme) => ({
          display: 'grid',
          alignContent: 'start',
          rowGap: '1px',
          minWidth: 0,
          borderRight: `${kkTokens.line.hair}px solid ${(theme.vars ?? theme).palette.divider}`,
        })}
      >
        {heads}
      </Box>
      <Box
        ref={surface.ref}
        onPointerDown={surface.onPointerDown}
        onPointerMove={surface.onPointerMove}
        onPointerUp={surface.onPointerUp}
        onPointerCancel={surface.onPointerCancel}
        data-kk-studio-g-viewport
        sx={{
          position: 'relative',
          minWidth: 0,
          overflow: 'clip',
          touchAction: 'none',
          cursor: 'ew-resize',
        }}
      >
        {children}
        <Box
          aria-hidden
          data-kk-studio-g-playhead
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: kkTokens.line.section,
            transform: 'translateX(-50%)',
            backgroundColor: (theme.vars ?? theme).palette.primary.main,
            pointerEvents: 'none',
            zIndex: 4,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              width: '0.625rem',
              height: '0.625rem',
              transform: 'translate(-50%, -30%) rotate(45deg)',
              borderRadius: `${kkTokens.radius.bar}px`,
              backgroundColor: (theme.vars ?? theme).palette.primary.main,
            },
          })}
        />
      </Box>
    </Box>
  );
};
