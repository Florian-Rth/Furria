import { KkStudioViewBand } from './internal/layout/KkStudioViewBand';
import { KkStudioViewLayer } from './internal/layout/KkStudioViewLayer';
import { KkStudioViewRoot } from './internal/layout/KkStudioViewRoot';
import { KkStudioViewStrip } from './internal/layout/KkStudioViewStrip';
import { KkStudioViewTools } from './internal/layout/KkStudioViewTools';
import { KkStudioViewBandNote } from './internal/ui/KkStudioViewBandNote';

export const KkStudioView = Object.assign(KkStudioViewRoot, {
  Tools: KkStudioViewTools,
  Strip: KkStudioViewStrip,
  Layer: KkStudioViewLayer,
  Band: KkStudioViewBand,
  BandNote: KkStudioViewBandNote,
});
