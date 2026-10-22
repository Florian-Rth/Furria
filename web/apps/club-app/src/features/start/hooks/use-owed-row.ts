import type { KkGroupTone } from '@furria/ui/group-tone';
import type { KkImageSource } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import type { KkAnswer } from '@furria/ui/KkAnswerChoice';
import type { KkIconName } from '@furria/ui/KkIcon';
import { toTimeLabel } from '@/lib/calendar-days';
import { entryIconOf, entryToneOf, toEntryMetaLine } from '../calendar-tile';
import type { StartEntry } from '../schemas';
import { formatSpokenDay } from '../start-labels';
import { useEntryAnswer } from './use-entry-answer';
import type { StartBoard } from './use-start-view';

export interface OwedRowView {
  title: string;
  when: string;
  image: KkImageSource | null;
  tone: KkGroupTone;
  icon: KkIconName;
  choiceLabel: string;
  value: KkAnswer | null;
  choose: (answer: KkAnswer) => void;
  error: string | undefined;
  disabled: boolean;
}

const WHEN_SEPARATOR = ' · ';
const THUMB_SIZES = '3rem';

const settled = (): void => undefined;

export const useOwedRow = (entry: StartEntry, board: StartBoard): OwedRowView => {
  const answer = useEntryAnswer({
    calendarEntryId: entry.calendarEntryId,
    onTouch: board.touch,
    onHeld: settled,
  });
  const meta = toEntryMetaLine(entry);
  const when = [formatSpokenDay(entry.startsAt), toTimeLabel(entry.startsAt), meta]
    .filter((part): part is string => part !== null)
    .join(WHEN_SEPARATOR);

  return {
    title: entry.title,
    when,
    image: toImageSource(entry.event?.picture ?? null, 'banner', THUMB_SIZES),
    tone: entryToneOf(entry),
    icon: entryIconOf(entry),
    choiceLabel: `Deine Antwort für ${entry.title}`,
    value: entry.attendance?.viewerAnswer ?? null,
    choose: answer.choose,
    error: answer.failure,
    disabled: answer.dims,
  };
};
