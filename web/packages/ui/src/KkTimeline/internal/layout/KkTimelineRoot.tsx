import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { LANE_KEY_WIDTH } from '../lane-sizes';
import type { KkTimelineDensity, KkTimelineRows } from '../timeline-paint';
import { rowVarsOf, TIMELINE_DENSITIES } from '../timeline-paint';
import { KkTimelineCentre } from '../ui/KkTimelineCentre';
import { KkTimelineCanvas } from './KkTimelineCanvas';

export interface KkTimelineWindow {
  start: number;
  end: number;
}

export type KkTimelineHandlers = Pick<
  HTMLAttributes<HTMLDivElement>,
  'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel' | 'onLostPointerCapture'
>;

export interface KkTimelineWork {
  areaRef: (node: HTMLDivElement | null) => void;
  handlers: KkTimelineHandlers;
}

interface KkTimelineRootProps extends PropsWithChildren {
  label: string;
  density: KkTimelineDensity;
  rows: KkTimelineRows;
  window: KkTimelineWindow;
  work?: KkTimelineWork | null;
  centred?: boolean;
  keys?: ReactNode;
  overlay?: ReactNode;
  sx?: KkSx;
}

const cursorOf = (centred: boolean, working: boolean): string | undefined => {
  if (centred) {
    return 'grab';
  }

  return working ? 'pointer' : undefined;
};

export const KkTimelineRoot: FC<KkTimelineRootProps> = ({
  label,
  density,
  rows,
  window,
  work = null,
  centred = false,
  keys = null,
  overlay = null,
  sx,
  children,
}) => {
  const { height } = TIMELINE_DENSITIES[density];
  const rowVars = rowVarsOf(density, rows);
  const working = work !== null;
  const canvas = centred ? (
    <>
      {children}
      <KkTimelineCentre />
    </>
  ) : (
    <KkTimelineCanvas start={window.start} end={window.end}>
      {children}
    </KkTimelineCanvas>
  );
  const cursor = cursorOf(centred, working);
  const hair = `${kkTokens.line.hair}px`;
  const workLeft =
    keys === null
      ? hair
      : {
          xs: `calc(${LANE_KEY_WIDTH.xs} + ${hair})`,
          desktop: `calc(${LANE_KEY_WIDTH.desktop} + ${hair})`,
        };
  const radius = `${kkTokens.radius.base}px`;
  const clipRadius =
    keys === null
      ? { borderRadius: radius }
      : { borderTopRightRadius: radius, borderBottomRightRadius: radius };

  return (
    <Box
      role="group"
      aria-label={label}
      sx={[
        {
          ...rowVars,
          position: 'relative',
          height,
          minWidth: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        direction="row"
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          overflow: 'clip',
          ...raisedSurface(theme),
        })}
      >
        {keys}
      </Stack>
      <Box
        ref={work?.areaRef}
        data-kk-timeline={density}
        data-kk-timeline-work={working || undefined}
        {...work?.handlers}
        sx={{
          position: 'absolute',
          top: kkTokens.line.hair,
          bottom: kkTokens.line.hair,
          right: kkTokens.line.hair,
          left: workLeft,
          cursor,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            overflow: 'clip',
            ...clipRadius,
          }}
        >
          {canvas}
        </Box>
        {overlay}
      </Box>
    </Box>
  );
};
