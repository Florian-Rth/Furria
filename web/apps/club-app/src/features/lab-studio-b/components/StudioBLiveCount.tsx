import { KkStudioBCount } from '@furria/ui/KkStudioBCount';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { countAt } from '@/features/act-player/music-timeline';
import { eightProgressAt } from '../studio-b-beats';
import { useStudioB } from '../studio-b-context';
import { COUNT_LABEL, eightLineOf } from '../studio-b-copy';
import type { ManualStep } from '../studio-b-manual';

interface StudioBLiveCountProps {
  step: ManualStep;
}

export const StudioBLiveCount: FC<StudioBLiveCountProps> = ({ step }) => {
  const { playback } = useStudioB();
  const seconds = usePlaybackSeconds(playback.player);
  const count = countAt(playback.segments, seconds);
  const progress = eightProgressAt(playback.countMarks, step.range, seconds);
  const eight = progress?.eight ?? null;
  const eights = progress?.eights ?? 0;

  return (
    <KkStudioBCount
      count={count?.count ?? null}
      eight={eight}
      eights={eights}
      share={progress?.share ?? 0}
      label={COUNT_LABEL}
      eightLabel={eightLineOf(eight, eights)}
    />
  );
};
