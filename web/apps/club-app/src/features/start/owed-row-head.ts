import type { KkGroupTone } from '@furria/ui/group-tone';
import type { KkImageSource } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import type { KkIconName } from '@furria/ui/KkIcon';
import { toTimeLabel } from '@/lib/calendar-days';
import { entryIconOf, entryToneOf, toEntryMetaLine } from './calendar-tile';
import type { StartEntry } from './schemas';
import { formatSpokenDay } from './start-labels';

export interface OwedRowHead {
  title: string;
  when: string;
  image: KkImageSource | null;
  tone: KkGroupTone;
  icon: KkIconName;
}

const WHEN_SEPARATOR = ' · ';
const THUMB_SIZES = '3rem';

export const toOwedRowHead = (entry: StartEntry): OwedRowHead => ({
  title: entry.title,
  when: [formatSpokenDay(entry.startsAt), toTimeLabel(entry.startsAt), toEntryMetaLine(entry)]
    .filter((part): part is string => part !== null)
    .join(WHEN_SEPARATOR),
  image: toImageSource(entry.event?.picture ?? null, 'banner', THUMB_SIZES),
  tone: entryToneOf(entry),
  icon: entryIconOf(entry),
});
