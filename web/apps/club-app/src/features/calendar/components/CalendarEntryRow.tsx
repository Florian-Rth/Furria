import { KkChip, KkFactRow, KkText } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { RUNNING_CHIP_LABEL, toEntryMetaLine } from '../calendar-labels';
import { toEntryTone } from '../calendar-tones';
import type { CalendarEntry } from '../schemas';
import { CalendarAttendanceRow } from './CalendarAttendanceRow';

const LANDING_KIND = 'calendar-entry';

interface CalendarEntryRowProps {
  entry: CalendarEntry;
  owned: boolean;
  highlightedKey: string | null;
}

export const CalendarEntryRow: FC<CalendarEntryRowProps> = ({ entry, owned, highlightedKey }) => {
  const tone = entry.isRunning ? 'accent' : 'neutral';
  const chip = entry.isRunning ? (
    <KkChip tone="accent" size="small" dot live>
      {RUNNING_CHIP_LABEL}
    </KkChip>
  ) : undefined;
  const actions = entry.asksForResponse ? <CalendarAttendanceRow entry={entry} /> : undefined;
  const span = toDayNumberLabel(entry.startsAt);
  const spanLabel = toWeekdayEyebrow(entry.startsAt);
  const meta = toEntryMetaLine(entry);
  const landingKey = toLandingKey(LANDING_KIND, entry.calendarEntryId);
  const description =
    entry.description === null ? null : (
      <KkText variant="body2" tone="secondary">
        {entry.description}
      </KkText>
    );

  return (
    <KkFactRow
      title={entry.title}
      span={span}
      spanLabel={spanLabel}
      meta={meta}
      tone={tone}
      groupTone={toEntryTone(entry)}
      chip={chip}
      actions={actions}
      highlight={owned && highlightedKey === landingKey}
      landing={owned ? landingKey : undefined}
      component={owned ? Link : undefined}
      to={owned ? '/calendar/$calendarEntryId' : undefined}
      params={owned ? { calendarEntryId: String(entry.calendarEntryId) } : undefined}
      search={owned ? (previous) => previous : undefined}
    >
      {description}
    </KkFactRow>
  );
};
