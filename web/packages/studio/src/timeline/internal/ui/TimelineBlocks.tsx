import type { KkTimelineBlockTone } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineRange } from '../../../models/music-timeline';
import { shareOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export interface TimelineBlock {
  key: string;
  range: TimelineRange;
  lead: string | null;
  title: string;
  meta: string | null;
  selected: boolean;
  current: boolean;
  label: string;
  onPress: () => void;
}

interface TimelineBlocksProps {
  tone: KkTimelineBlockTone;
  blocks: readonly TimelineBlock[];
}

export const TimelineBlocks: FC<TimelineBlocksProps> = ({ tone, blocks }) => {
  const { length } = useTimeline();
  const shown = blocks.map((block) => (
    <KkTimeline.Block
      key={block.key}
      start={shareOf(block.range.start, length)}
      end={shareOf(block.range.end, length)}
      lead={block.lead}
      title={block.title}
      meta={block.meta}
      tone={tone}
      selected={block.selected}
      current={block.current}
      label={block.label}
      onPress={block.onPress}
    />
  ));

  return <TimelineStrip>{shown}</TimelineStrip>;
};
