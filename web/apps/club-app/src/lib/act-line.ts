import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { PersonRef } from '@/lib/api/schemas';

const SELF_LABEL = 'dir';
const SAME_YEAR_PATTERN = 'd. MMM';
const OTHER_YEAR_PATTERN = 'd. MMM yyyy';

const toActorPhrase = (actor: PersonRef | null, viewerPersonId: number | null): string => {
  if (actor === null) {
    return '';
  }

  return ` von ${actor.personId === viewerPersonId ? SELF_LABEL : actor.firstName}`;
};

const formatActDay = (actedOn: Date, today: Date): string => {
  const pattern =
    actedOn.getFullYear() === today.getFullYear() ? SAME_YEAR_PATTERN : OTHER_YEAR_PATTERN;

  return format(actedOn, pattern, { locale: de });
};

export const toActLine = (
  act: string,
  actor: PersonRef | null,
  viewerPersonId: number | null,
  actedOn: Date,
  today: Date,
): string => `${act}${toActorPhrase(actor, viewerPersonId)} am ${formatActDay(actedOn, today)}`;
