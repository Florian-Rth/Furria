import { KkEightsStripRoot } from './internal/layout/KkEightsStripRoot';
import { KkEightsStripTools } from './internal/layout/KkEightsStripTools';
import { KkEightsStripName } from './internal/ui/KkEightsStripName';
import { KkEightsStripTitle } from './internal/ui/KkEightsStripTitle';

export const KkEightsStrip = Object.assign(KkEightsStripRoot, {
  Title: KkEightsStripTitle,
  Name: KkEightsStripName,
  Tools: KkEightsStripTools,
});
