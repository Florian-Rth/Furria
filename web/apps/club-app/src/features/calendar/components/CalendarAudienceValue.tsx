import { KkNameLine } from '@furria/ui/KkNameLine';
import type { FC } from 'react';
import { FACT_LABELS } from '../calendar-agenda-copy';
import { useCalendarAudienceNames } from '../hooks/use-calendar-audience-names';
import type { CalendarEntry } from '../schemas';
import { CalendarNamesSheet } from './CalendarNamesSheet';

interface CalendarAudienceValueProps {
  entry: Pick<CalendarEntry, 'audience' | 'audiencePeople'>;
  label: string;
}

export const CalendarAudienceValue: FC<CalendarAudienceValueProps> = ({ entry, label }) => {
  const names = useCalendarAudienceNames(entry, FACT_LABELS.audience);

  if (names.line === null) {
    return label;
  }

  return (
    <>
      <KkNameLine names={names.line.names} more={names.line.more} onOpen={names.open} />
      <CalendarNamesSheet title={FACT_LABELS.audience} tabs={names.tabs} sheet={names.sheet} />
    </>
  );
};
