import { KkStudioCTimeline } from '@furria/ui/KkStudioCTimeline';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { partOfStep, stepAt } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import { loopBlockLabelOf } from '../studio-c-copy';
import { partBlocksOf } from '../studio-c-timeline';

const partIdAt = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  seconds: number,
): number | null => {
  const step = stepAt(steps, seconds);

  return step === null ? null : (partOfStep(parts, step.stepId)?.partId ?? null);
};

interface StudioCPartBlocksProps {
  playback: StudioPlayback;
  pixelsPerSecond: number;
}

export const StudioCPartBlocks: FC<StudioCPartBlocksProps> = ({ playback, pixelsPerSecond }) => {
  const { player, steps, parts, state, controls } = playback;
  const currentId = usePlaybackSelection(player, (seconds) => partIdAt(steps, parts, seconds));

  const blocks = partBlocksOf(parts, steps, state.loop, currentId, pixelsPerSecond).map((block) => {
    const label = loopBlockLabelOf(block.item.name, block.state === 'looped');
    const select = (): void => {
      controls.loopPart(block.item);
    };

    return (
      <KkStudioCTimeline.Block
        key={block.item.partId}
        kind="part"
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
