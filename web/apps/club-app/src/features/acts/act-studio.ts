import { musicSegmentsOf } from '@/features/act-player/music-timeline';
import type { CastPerson } from '@/features/running-order/schemas';
import type { ActPageSearch, ActViewer, CoEditor, Studio } from './schemas';

export type ActPageMode = 'card' | 'practice' | 'details' | 'training';

export const coEditorCandidatesOf = (
  cast: readonly CastPerson[],
  coEditors: readonly CoEditor[],
): CastPerson[] => {
  const granted = new Set(coEditors.map((coEditor) => coEditor.personId));

  return cast.filter((person) => !person.absent && !granted.has(person.personId));
};

export const canChangeCoEditors = (
  canGrant: boolean,
  act: { closed: boolean; archived: boolean },
): boolean => canGrant && !act.closed && !act.archived;

export const canPractise = (studio: Studio | null): boolean =>
  studio !== null && musicSegmentsOf(studio).some((segment) => segment.audible);

export const seesDetailsOf = (viewer: ActViewer): boolean =>
  viewer.canEditStudio ||
  viewer.canEditSettings ||
  viewer.canGrantCoEditors ||
  viewer.canMarkAttendance;

export interface ActPageViewer {
  canEditStudio: boolean;
  seesDetails: boolean;
}

export const actPageModeOf = (
  studio: Studio | null | undefined,
  viewer: ActPageViewer,
  search: Pick<ActPageSearch, 'view' | 'settings'>,
): ActPageMode => {
  if (search.view === 'details' || search.settings === true) {
    return studio === undefined || viewer.seesDetails ? 'details' : 'card';
  }
  if (search.view === 'training') {
    return studio === undefined || canPractise(studio) ? 'training' : 'card';
  }
  if (search.view !== 'play') {
    return 'card';
  }
  if (studio === undefined) {
    return 'practice';
  }

  return studio !== null && (viewer.canEditStudio || canPractise(studio)) ? 'practice' : 'card';
};
