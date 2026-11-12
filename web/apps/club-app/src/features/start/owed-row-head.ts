import type { KkGroupTone } from '@furria/ui/group-tone';
import { eventToneOf } from '@furria/ui/group-tone';
import type { KkImageSource } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import type { KkIconName } from '@furria/ui/KkIcon';
import { toTimeLabel } from '@/lib/calendar-days';
import { entryIconOf, entryToneOf, toEntryMetaLine } from './calendar-tile';
import type { OwedHost } from './owed-items';
import type { StartAnnouncementAddOns, StartEntry } from './schemas';
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
const ANNOUNCEMENT_LABEL = 'Aushang';
const ANNOUNCEMENT_ICON: KkIconName = 'campaign';

const toEntryRowHead = (entry: StartEntry): OwedRowHead => ({
  title: entry.title,
  when: [formatSpokenDay(entry.startsAt), toTimeLabel(entry.startsAt), toEntryMetaLine(entry)]
    .filter((part): part is string => part !== null)
    .join(WHEN_SEPARATOR),
  image: toImageSource(entry.event?.picture ?? null, 'banner', THUMB_SIZES),
  tone: entryToneOf(entry),
  icon: entryIconOf(entry),
});

const toAnnouncementRowHead = (announcement: StartAnnouncementAddOns): OwedRowHead => ({
  title: announcement.title,
  when: [ANNOUNCEMENT_LABEL, formatSpokenDay(announcement.publishedAt)].join(WHEN_SEPARATOR),
  image: null,
  tone: eventToneOf(announcement.announcementId),
  icon: ANNOUNCEMENT_ICON,
});

export const toOwedRowHead = (host: OwedHost): OwedRowHead =>
  host.kind === 'calendarEntry'
    ? toEntryRowHead(host.entry)
    : toAnnouncementRowHead(host.announcement);
