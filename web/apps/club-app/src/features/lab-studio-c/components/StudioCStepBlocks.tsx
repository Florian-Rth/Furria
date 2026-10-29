import { KkStudioCTimeline } from '@furria/ui/KkStudioCTimeline';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { stepAt } from '@/features/act-player/music-timeline';
import { loopBlockLabelOf } from '../studio-c-copy';
import { stepBlocksOf } from '../studio-c-timeline';

interface StudioCStepBlocksProps {
  playback: StudioPlayback;
  pixelsPerSecond: number;
}

export const StudioCStepBlocks: FC<StudioCStepBlocksProps> = ({ playback, pixelsPerSecond }) => {
  const { player, steps, state, controls } = playback;
  const currentId = usePlaybackSelection(
    player,
    (seconds) => stepAt(steps, seconds)?.stepId ?? null,
  );

  const blocks = stepBlocksOf(steps, state.loop, currentId, pixelsPerSecond).map((block) => {
    const label = loopBlockLabelOf(block.item.name, block.state === 'looped');
    const select = (): void => {
      controls.loopStep(block.item);
    };

    return (
      <KkStudioCTimeline.Block
        key={block.item.stepId}
        kind="step"
        left={block.left}
        width={block.width}
        number={block.number}
        name={block.item.name}
        meta={block.meta}
        state={block.state}
        label={label}
        onSelect={select}
      />
    );
  });

  return <>{blocks}</>;
};
