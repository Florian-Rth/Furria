import { KkEightsFrameArea } from './internal/layout/KkEightsFrameArea';
import { KkEightsFrameRoot } from './internal/layout/KkEightsFrameRoot';
import { KkEightsFrameScroll } from './internal/layout/KkEightsFrameScroll';
import { KkEightsFrameWave } from './internal/layout/KkEightsFrameWave';
import { KkEightsFrameHeading } from './internal/ui/KkEightsFrameHeading';

export type { KkEightsFrameAreaName } from './internal/layout/KkEightsFrameArea';

export const KkEightsFrame = Object.assign(KkEightsFrameRoot, {
  Area: KkEightsFrameArea,
  Heading: KkEightsFrameHeading,
  Wave: KkEightsFrameWave,
  Scroll: KkEightsFrameScroll,
});
