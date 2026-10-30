import { KkStudioHViewLayer } from './internal/layout/KkStudioHViewLayer';
import { KkStudioHViewRoot } from './internal/layout/KkStudioHViewRoot';
import { KkStudioHViewStrip } from './internal/layout/KkStudioHViewStrip';
import { KkStudioHViewTools } from './internal/layout/KkStudioHViewTools';

export const KkStudioHView = Object.assign(KkStudioHViewRoot, {
  Tools: KkStudioHViewTools,
  Strip: KkStudioHViewStrip,
  Layer: KkStudioHViewLayer,
});
