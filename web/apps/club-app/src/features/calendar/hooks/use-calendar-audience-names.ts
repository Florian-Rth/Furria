import { useMeQuery } from '@/features/session/api';
import type { NameLine, NamesTab } from '../calendar-names';
import { toNameLine, toPersonEntry } from '../calendar-names';
import type { CalendarEntry } from '../schemas';
import type { NamesSheetControl } from './use-names-sheet';
import { useNamesSheet } from './use-names-sheet';

const AUDIENCE_TAB_ID = 'audience';

export interface CalendarAudienceNames {
  line: NameLine | null;
  tabs: NamesTab[];
  sheet: NamesSheetControl;
  open: () => void;
}

export const useCalendarAudienceNames = (
  entry: Pick<CalendarEntry, 'audience' | 'audiencePeople'>,
  label: string,
): CalendarAudienceNames => {
  const ownPersonId = useMeQuery().data?.person?.id ?? null;
  const sheet = useNamesSheet();
  const entries =
    entry.audience === 'people'
      ? entry.audiencePeople.map((person) => toPersonEntry(person, ownPersonId))
      : [];

  return {
    line: toNameLine(entries),
    tabs: [{ id: AUDIENCE_TAB_ID, label, count: entries.length, entries }],
    sheet,
    open: () => {
      sheet.open(AUDIENCE_TAB_ID);
    },
  };
};
