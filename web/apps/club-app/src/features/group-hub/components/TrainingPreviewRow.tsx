import { KkChip, KkTickRow } from '@furria/ui';
import type { FC } from 'react';
import { toDayNumberLabel, toTimeSpanLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import type { TrainingPreviewEntry } from '../training-preview';
import { toCollisionLine } from '../training-preview';

const ALREADY_LINE = 'Steht schon im Kalender.';
const ARCHIVED_VENUE_LINE = 'Der Ort ist archiviert. Es wird kein Termin angelegt.';
const NO_VENUE_LINE = 'Ohne Ort';

interface TrainingPreviewRowProps {
  entry: TrainingPreviewEntry;
  onToggle: (key: string) => void;
}

const toMetaLine = (entry: TrainingPreviewEntry): string => {
  if (entry.row.state === 'alreadyExists') {
    return ALREADY_LINE;
  }
  if (entry.row.state === 'venueArchived') {
    return ARCHIVED_VENUE_LINE;
  }

  return toCollisionLine(entry.row) ?? entry.row.venueName ?? NO_VENUE_LINE;
};

export const TrainingPreviewRow: FC<TrainingPreviewRowProps> = ({ entry, onToggle }) => {
  const chip = (
    <KkChip tone={entry.chip.tone} dot={entry.chip.dot} size="small">
      {entry.chip.label}
    </KkChip>
  );

  const toggle = (): void => {
    onToggle(entry.key);
  };

  return (
    <KkTickRow
      title={toTimeSpanLabel(entry.row.startsAt, entry.row.endsAt)}
      span={toDayNumberLabel(entry.row.startsAt)}
      spanLabel={toWeekdayEyebrow(entry.row.startsAt)}
      meta={toMetaLine(entry)}
      chip={chip}
      checked={entry.checked}
      dimmed={entry.dimmed}
      disabled={entry.blocked}
      onToggle={toggle}
    />
  );
};
