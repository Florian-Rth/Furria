import { KkStudioALensRoot } from './internal/layout/KkStudioALensRoot';
import { KkStudioALensTrack } from './internal/layout/KkStudioALensTrack';
import { KkStudioALensBeat } from './internal/ui/KkStudioALensBeat';
import { KkStudioALensEdge } from './internal/ui/KkStudioALensEdge';
import { KkStudioALensWave } from './internal/ui/KkStudioALensWave';

export const KkStudioALens = Object.assign(KkStudioALensRoot, {
  Track: KkStudioALensTrack,
  Wave: KkStudioALensWave,
  Beat: KkStudioALensBeat,
  Edge: KkStudioALensEdge,
});
