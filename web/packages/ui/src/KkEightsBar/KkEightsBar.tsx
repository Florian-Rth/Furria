import { KkEightsBarGap } from './internal/layout/KkEightsBarGap';
import { KkEightsBarRoot } from './internal/layout/KkEightsBarRoot';
import { KkEightsBarClock } from './internal/ui/KkEightsBarClock';
import { KkEightsBarProgress } from './internal/ui/KkEightsBarProgress';
import { KkEightsBarTool } from './internal/ui/KkEightsBarTool';
import { KkEightsBarZoom } from './internal/ui/KkEightsBarZoom';

export type { KkEightsSegmentState } from './internal/ui/KkEightsBarProgress';
export type { KkEightsBarZoomOption } from './internal/ui/KkEightsBarZoom';

export const KkEightsBar = Object.assign(KkEightsBarRoot, {
  Gap: KkEightsBarGap,
  Tool: KkEightsBarTool,
  Zoom: KkEightsBarZoom,
  Progress: KkEightsBarProgress,
  Clock: KkEightsBarClock,
});
