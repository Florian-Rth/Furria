import { KkChip, KkFactRow, KkText } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import type { CalendarEntryLink } from '../calendar-authoring';
import { RUNNING_CHIP_LABEL, toEntryMetaLine, toEntrySales } from '../calendar-labels';
import { toEntryTone } from '../calendar-tones';
import type { CalendarEntry } from '../schemas';
import { CalendarAttendanceChoice } from './CalendarAttendanceChoice';
import { CalendarEventFactLines } from './CalendarEventFactLines';

const LANDING_KIND = 'calendar-entry';

interface CalendarEntryRowProps {
  entry: CalendarEntry;
  owned: boolean;
  link: CalendarEntryLink | null;
  highlightedKey: string | null;
}

export const CalendarEntryRow: FC<CalendarEntryRowProps> = ({
  entry,
  owned,
  link,
  highlightedKey,
}) => {
  const tone = entry.isRunning ? 'accent' : 'neutral';
  const sales = toEntrySales(entry);
  const salesChip =
    sales === null ? undefined : (
      <KkChip tone={sales.tone} size="small">
        {sales.label}
      </KkChip>
    );
  const chip = entry.isRunning ? (
    <KkChip tone="accent" size="small" dot live>
      {RUNNING_CHIP_LABEL}
    </KkChip>
  ) : (
    salesChip
  );
  const actions = entry.asksForResponse ? <CalendarAttendanceChoice entry={entry} /> : undefined;
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

  const eventFacts = entry.event === null ? null : <CalendarEventFactLines facts={entry.event} />;
  const keepsSearch = link?.to === '/calendar/$calendarEntryId';

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
      component={link === null ? undefined : Link}
      to={link?.to}
      params={link?.params}
      search={keepsSearch ? (previous) => previous : undefined}
    >
      {eventFacts}
      {description}
    </KkFactRow>
  );
};
