import { format } from 'date-fns';
import { de } from 'date-fns/locale/de';
import type { PersonRef } from '@/lib/api/schemas';

const SELF_LABEL = 'dir';
const SAME_YEAR_PATTERN = 'd. MMM';
const OTHER_YEAR_PATTERN = 'd. MMM yyyy';

export type ActLineActor =
  | { kind: 'nobody' }
  | { kind: 'viewer' }
  | { kind: 'other'; firstName: string };

export const toActLineActor = (
  actor: PersonRef | null,
  viewerPersonId: number | null,
): ActLineActor => {
  if (actor === null) {
    return { kind: 'nobody' };
  }
  if (actor.personId === viewerPersonId) {
    return { kind: 'viewer' };
  }

  return { kind: 'other', firstName: actor.firstName };
};

const toActorPhrase = (actor: PersonRef | null, viewerPersonId: number | null): string => {
  const actLineActor = toActLineActor(actor, viewerPersonId);

  if (actLineActor.kind === 'nobody') {
    return '';
  }

  return ` von ${actLineActor.kind === 'viewer' ? SELF_LABEL : actLineActor.firstName}`;
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
