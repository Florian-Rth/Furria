import { KkStudioIFrameLayer } from './internal/layout/KkStudioIFrameLayer';
import { KkStudioIFrameRoot } from './internal/layout/KkStudioIFrameRoot';

export type { KkStudioIFrameRole } from './internal/layout/KkStudioIFrameLayer';
export type { KkStudioIFrameSurface } from './internal/layout/KkStudioIFrameRoot';

export const KkStudioIFrame = Object.assign(KkStudioIFrameRoot, {
  Layer: KkStudioIFrameLayer,
});
