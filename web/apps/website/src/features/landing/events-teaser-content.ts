import { formatClockTime, formatDayOfMonth, formatMonthAbbreviation } from '@/lib/date';

export const eventsTeaserHeading = 'DIE VERANSTALTUNGEN';

export const eventsTeaserAllLabel = 'Alle Termine →';

export interface EventDisplay {
  day: string;
  month: string;
  time: string;
}

export const deriveEventDisplay = (startsAt: string): EventDisplay => ({
  day: formatDayOfMonth(startsAt),
  month: formatMonthAbbreviation(startsAt),
  time: `${formatClockTime(startsAt)} Uhr`,
});
