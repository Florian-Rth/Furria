import { KkStudioGTransportEnd } from './internal/layout/KkStudioGTransportEnd';
import { KkStudioGTransportRoot } from './internal/layout/KkStudioGTransportRoot';
import { KkStudioGTransportClock } from './internal/ui/KkStudioGTransportClock';
import { KkStudioGTransportTool } from './internal/ui/KkStudioGTransportTool';

export type { KkStudioGTransportToolKind } from './internal/ui/KkStudioGTransportTool';

export const KkStudioGTransport = Object.assign(KkStudioGTransportRoot, {
  Clock: KkStudioGTransportClock,
  End: KkStudioGTransportEnd,
  Tool: KkStudioGTransportTool,
});
