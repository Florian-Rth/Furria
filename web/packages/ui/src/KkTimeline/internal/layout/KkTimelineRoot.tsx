import Box from '@mui/material/Box';
import type { FC, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import type { KkTimelineDensity } from '../timeline-paint';
import { LANE_VARS, TIMELINE_LANES } from '../timeline-paint';
import { KkTimelineCentre } from '../ui/KkTimelineCentre';
import { KkTimelineSeekCanvas } from './KkTimelineSeekCanvas';

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
  window: KkTimelineWindow;
  onSeek: (share: number) => void;
  work?: KkTimelineWork | null;
  overlay?: ReactNode;
  sx?: KkSx;
}

export const KkTimelineRoot: FC<KkTimelineRootProps> = ({
  label,
  density,
  window,
  onSeek,
  work = null,
  overlay = null,
  sx,
  children,
}) => {
  const lanes = TIMELINE_LANES[density];
  const working = work !== null;
  const canvas = working ? (
    <>
      {children}
      <KkTimelineCentre />
    </>
  ) : (
    <KkTimelineSeekCanvas start={window.start} end={window.end} onSeek={onSeek}>
      {children}
    </KkTimelineSeekCanvas>
  );

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
          [LANE_VARS.ruler]: lanes.ruler,
          [LANE_VARS.parts]: lanes.parts,
          [LANE_VARS.steps]: lanes.steps,
          position: 'relative',
          height: lanes.height,
          minWidth: 0,
          cursor: working ? 'grab' : undefined,
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
