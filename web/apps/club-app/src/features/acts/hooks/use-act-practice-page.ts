import { eveningCastOf } from '@/features/act-studio/studio-evening';
import type { CastPerson } from '@/features/running-order/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { toEveningLabel } from '../act-evenings-copy';
import type { ActScreen } from '../act-screens';
import { actScreenPathOf, startedHallOf, switchedEditingOf } from '../act-screens';
import type { ActScreenSearch, StudioEvening } from '../schemas';
import type { ActScreenPage } from './use-act-screen-page';
import { useActScreenPage } from './use-act-screen-page';

export interface ActPracticePage extends ActScreenPage {
  title: string;
  evening: StudioEvening | null;
  isEveningMissing: boolean;
  redirectPath: string | null;
  eveningCast: readonly CastPerson[];
  startEditing: boolean;
  startHall: () => void;
  toggleEditing: () => void;
}

const eventIdOf = (rawEventId: string | null): number | null =>
  rawEventId === null ? null : parsePositiveId(rawEventId);

export const useActPracticePage = (
  rawActId: string,
  rawEventId: string | null,
  editing: boolean,
  search: ActScreenSearch,
): ActPracticePage => {
  const eventId = eventIdOf(rawEventId);
  const page = useActScreenPage(rawActId, search, editing ? 'edit' : 'practice', eventId);
  const { actId, name, act } = page.load;
  const studio = page.load.query.data?.studio;
  const evening = studio?.evenings.find((candidate) => candidate.eventId === eventId) ?? null;
  const isEveningMissing =
    rawEventId !== null && (eventId === null || (studio !== undefined && evening === null));
  const current: ActScreen = { kind: editing ? 'edit' : 'practice', eventId };
  const practisePath =
    actId === null ? null : actScreenPathOf(actId, { kind: 'practice', eventId });
  const redirectPath = page.access === 'practice' ? practisePath : null;

  return {
    ...page,
    title: evening === null ? name : `${name} · ${toEveningLabel(evening)}`,
    evening,
    isEveningMissing,
    redirectPath: page.access === 'hub' ? page.hubPath : redirectPath,
    eveningCast: eveningCastOf(act?.cast ?? [], evening?.appearance ?? null),
    startEditing: editing,
    startHall: () => {
      page.open(startedHallOf(studio?.trainings ?? []));
    },
    toggleEditing: () => {
      page.swap(switchedEditingOf(current));
    },
  };
};
