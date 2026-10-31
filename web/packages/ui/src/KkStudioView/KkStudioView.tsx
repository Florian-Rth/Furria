import { KkStudioViewBand } from './internal/layout/KkStudioViewBand';
import { KkStudioViewRoot } from './internal/layout/KkStudioViewRoot';
import { KkStudioViewTools } from './internal/layout/KkStudioViewTools';
import { KkStudioViewBandNote } from './internal/ui/KkStudioViewBandNote';

export const KkStudioView = Object.assign(KkStudioViewRoot, {
  Tools: KkStudioViewTools,
  Band: KkStudioViewBand,
  BandNote: KkStudioViewBandNote,
});
