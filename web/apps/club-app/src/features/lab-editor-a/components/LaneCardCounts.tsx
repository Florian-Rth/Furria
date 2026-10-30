import type { KkLaneCardsEight } from '@furria/ui/KkLaneCards';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioStep } from '@/features/acts/schemas';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { countCellLabelOf, eightTextOf, LANE_COUNTS, LANE_COUNTS_NONE } from '../lane-copy';
import { countIndexAt, stepEightsOf } from '../lane-time';

interface LaneCardCountsProps {
  lane: LaneEditor;
  step: StudioStep;
  current: boolean;
}

const NONE = -1;

export const LaneCardCounts: FC<LaneCardCountsProps> = ({ lane, step, current }) => {
  const { countMarks, player } = lane.screen.playback;
  const lit = usePlaybackSelection(player, (seconds) =>
    current ? countIndexAt(countMarks, seconds) : NONE,
  );
  const eights: KkLaneCardsEight[] = stepEightsOf(
    countMarks,
    step.startSeconds ?? 0,
    step.endSeconds ?? 0,
  ).map((eight) => ({
    key: String(eight.eight),
    text: eightTextOf(eight.eight),
    cells: eight.counts.map((count) => ({
      key: String(count.index),
      count: count.count,
      lit: count.index === lit,
      label: countCellLabelOf(eight.eight, count.count),
      onSeek: () => {
        player.seek(count.seconds);
      },
    })),
  }));

  return <KkLaneCards.Counts label={LANE_COUNTS} empty={LANE_COUNTS_NONE} eights={eights} />;
};
