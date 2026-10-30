import type { KkChipTone } from '@furria/ui/KkChip';
import { KkChip } from '@furria/ui/KkChip';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonEvening } from '@/features/season/schemas';
import {
  CONFIRMED_CHIP,
  DRAFT_CHIP,
  NO_ORDER_CHIP,
  TODAY_CHIP,
  toEveningCount,
  toEveningDate,
  toEveningPosition,
  toMarkChip,
} from '../season-b-copy';
import { useSeasonBoardContext } from '../season-board-context';
import type { EveningColumn } from '../season-columns';
import { markPlaceOf } from '../season-columns';

interface SeasonEveningHeadProps {
  column: EveningColumn;
  position: number;
  total: number;
}

interface StateChip {
  label: string;
  tone: KkChipTone;
}

const stateChipOf = (evening: SeasonEvening): StateChip => {
  if (!evening.hasRunningOrder) {
    return { label: NO_ORDER_CHIP, tone: 'neutral' };
  }

  return evening.confirmed
    ? { label: CONFIRMED_CHIP, tone: 'green' }
    : { label: DRAFT_CHIP, tone: 'neutral' };
};

export const SeasonEveningHead: FC<SeasonEveningHeadProps> = ({ column, position, total }) => {
  const board = useSeasonBoardContext();
  const evening = column.evening;
  const chip = stateChipOf(evening);
  const today =
    board.todayEventId === evening.eventId ? (
      <KkChip tone="accent" size="small" dot>
        {TODAY_CHIP}
      </KkChip>
    ) : null;
  const markLabel =
    board.markedActId === null || board.markedName === null
      ? null
      : toMarkChip(board.markedName, markPlaceOf(column, board.markedActId));
  const marked =
    markLabel === null ? null : (
      <KkChip tone="gold" size="small">
        {markLabel}
      </KkChip>
    );
  const date = toEveningDate(evening.startsAt);
  const place = toEveningPosition(position, total);
  const count = toEveningCount(column.lines.length, column.tray.length);

  return (
    <KkPanel variant="block">
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>
        <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          <KkEyebrow tone="muted">{date}</KkEyebrow>
          {today}
          <KkMeta>{place}</KkMeta>
        </Stack>
        <KkHeading level={4} component="h2">
          {evening.title}
        </KkHeading>
        <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          <KkMeta>{count}</KkMeta>
          <KkChip tone={chip.tone} size="small">
            {chip.label}
          </KkChip>
          {marked}
        </Stack>
      </Stack>
    </KkPanel>
  );
};
