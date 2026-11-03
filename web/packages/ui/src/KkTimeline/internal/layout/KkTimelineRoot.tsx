import Box from '@mui/material/Box';
import type { FC, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
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

  return (
    <Box
      ref={work?.areaRef}
      role="group"
      aria-label={label}
      data-kk-timeline={density}
      data-kk-timeline-work={working || undefined}
      {...work?.handlers}
      sx={[
        {
          ...rowVars,
          position: 'relative',
          height,
          minWidth: 0,
          cursor,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          borderRadius: `${kkTokens.radius.base}px`,
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          overflow: 'clip',
          ...raisedSurface(theme),
        })}
      >
        {canvas}
      </Box>
      {overlay}
    </Box>
  );
};
