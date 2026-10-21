import { KkTallyStrip } from '@furria/ui';
import type { FC } from 'react';
import type { BoardSummary, QueueCounts } from '../board-hub';
import { formatQueueDay } from '../board-hub';
import {
  COUNTERS,
  COUNTERS_LABEL,
  NEXT_LABEL,
  STRIP_LABEL,
  toNextFact,
  toRingCaption,
  toRingLabel,
} from '../board-hub-copy';
import type { BoardFilter } from '../schemas';
import { BoardCounter } from './BoardCounter';

interface BoardStripProps {
  summary: BoardSummary;
  counts: QueueCounts;
  filter: BoardFilter;
  today: string;
  onChoose: (filter: BoardFilter) => void;
}

export const BoardStrip: FC<BoardStripProps> = ({ summary, counts, filter, today, onChoose }) => {
  const counters = COUNTERS.map((view) => (
    <BoardCounter
      key={view.id}
      view={view}
      count={counts[view.id]}
      selected={view.id === filter}
      onChoose={onChoose}
    />
  ));
  const nextDay = summary.next === null ? '' : formatQueueDay(summary.next.day, today);
  const nextFact = summary.next === null ? '' : toNextFact(summary.next);
  const next =
    summary.next === null ? null : (
      <KkTallyStrip.Next label={NEXT_LABEL} day={nextDay} fact={nextFact} />
    );
  const ringLabel = toRingLabel(summary.held, summary.active);
  const caption = toRingCaption(summary.active);

  return (
    <KkTallyStrip label={STRIP_LABEL}>
      <KkTallyStrip.Bar>
        <KkTallyStrip.Summary
          ringLabel={ringLabel}
          value={summary.held}
          total={summary.active}
          caption={caption}
        />
        <KkTallyStrip.Counters label={COUNTERS_LABEL}>{counters}</KkTallyStrip.Counters>
      </KkTallyStrip.Bar>
      {next}
    </KkTallyStrip>
  );
};
