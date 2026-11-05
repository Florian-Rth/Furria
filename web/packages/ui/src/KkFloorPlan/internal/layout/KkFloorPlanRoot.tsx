import Box from '@mui/material/Box';
import type { FC, PropsWithChildren, Ref } from 'react';
import type { KkSx } from '../../../kk-sx';
import type { KkPlanView, KkPlanViewportSize } from '../../floor-plan-view';
import { planViewBox } from '../../floor-plan-view';
import { planPalette } from '../floor-plan-paint';
import { FloorPlanContext } from '../logic/floor-plan-context';
import type { KkFloorPlanHandle, KkPlanPointerEvent } from '../logic/use-floor-plan-viewport';
import { useFloorPlanViewport } from '../logic/use-floor-plan-viewport';
import { KkFloorPlanGrid } from '../ui/KkFloorPlanGrid';

export type KkPlanCursor = 'default' | 'crosshair' | 'move' | 'pointer' | 'copy';

interface KkFloorPlanRootProps extends PropsWithChildren {
  label: string;
  view?: KkPlanView;
  defaultView?: KkPlanView;
  onViewChange?: (view: KkPlanView) => void;
  panning?: boolean;
  cursor?: KkPlanCursor;
  grid?: boolean;
  touch?: boolean;
  onPlanPointerDown?: (event: KkPlanPointerEvent) => void;
  onPlanPointerMove?: (event: KkPlanPointerEvent) => void;
  onPlanPointerUp?: (event: KkPlanPointerEvent) => void;
  onPlanPointerCancel?: (event: KkPlanPointerEvent) => void;
  onPlanDoubleClick?: (event: KkPlanPointerEvent) => void;
  onViewportResize?: (size: KkPlanViewportSize) => void;
  ref?: Ref<KkFloorPlanHandle>;
  sx?: KkSx;
}

const cursorOf = (isPanning: boolean, isPanReady: boolean, cursor: KkPlanCursor): string =>
  isPanning ? 'grabbing' : isPanReady ? 'grab' : cursor;

export const KkFloorPlanRoot: FC<KkFloorPlanRootProps> = ({
  label,
  view,
  defaultView,
  onViewChange,
  panning = false,
  cursor = 'default',
  grid = true,
  touch = false,
  onPlanPointerDown,
  onPlanPointerMove,
  onPlanPointerUp,
  onPlanPointerCancel,
  onPlanDoubleClick,
  onViewportResize,
  ref,
  sx,
  children,
}) => {
  const viewport = useFloorPlanViewport({
    view,
    defaultView,
    onViewChange,
    panning,
    onPlanPointerDown,
    onPlanPointerMove,
    onPlanPointerUp,
    onPlanPointerCancel,
    onPlanDoubleClick,
    onViewportResize,
    handle: ref,
  });
  const isMeasured = viewport.size.width > 0 && viewport.size.height > 0;
  const box = planViewBox(viewport.view, isMeasured ? viewport.size : { width: 1, height: 1 });
  const viewBox = `${box.x} ${box.y} ${box.width} ${box.height}`;
  const gridLayer =
    grid && isMeasured ? <KkFloorPlanGrid box={box} scale={viewport.view.scale} /> : null;
  const state = { scale: viewport.view.scale, touch };
  const pointer = cursorOf(viewport.isPanning, viewport.isPanReady, cursor);

  return (
    <Box
      ref={viewport.measure}
      data-kk-floor-plan
      sx={[
        (theme) => ({
          position: 'relative',
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          touchAction: 'none',
          userSelect: 'none',
          backgroundColor: planPalette(theme).background.default,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="svg"
        role="application"
        aria-label={label}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={viewport.pointerDown}
        onPointerMove={viewport.pointerMove}
        onPointerUp={viewport.pointerUp}
        onPointerCancel={viewport.pointerCancel}
        onDoubleClick={viewport.doubleClick}
        sx={(theme) => ({
          ...theme.typography.caption,
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: pointer,
        })}
      >
        {gridLayer}
        <FloorPlanContext.Provider value={state}>{children}</FloorPlanContext.Provider>
      </Box>
    </Box>
  );
};
