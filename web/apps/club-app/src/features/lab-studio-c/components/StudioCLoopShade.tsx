import { KkStudioCTimeline } from '@furria/ui/KkStudioCTimeline';
import type { FC } from 'react';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import { loopSpanOf } from '../studio-c-timeline';

interface StudioCLoopShadeProps {
  loop: TimelineRange | null;
  pixelsPerSecond: number;
}

export const StudioCLoopShade: FC<StudioCLoopShadeProps> = ({ loop, pixelsPerSecond }) => {
  const span = loopSpanOf(loop, pixelsPerSecond);

  if (span === null) {
    return null;
  }

  return <KkStudioCTimeline.Loop left={span.left} width={span.width} />;
};
