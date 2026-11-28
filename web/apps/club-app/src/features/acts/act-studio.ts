import { canPractise } from '@furria/studio/music-timeline';
import type { CastPerson } from '@/features/running-order/schemas';
import type { ActStudio, ActViewer, CoEditor } from './schemas';

export type ActStudioScreen = 'practice' | 'edit';

export type ActScreenAccess = 'open' | 'practice' | 'hub';

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

export const seesDetailsOf = (viewer: ActViewer): boolean =>
  viewer.canEditStudio || viewer.canEditSettings || viewer.canGrantCoEditors;

export const actScreenAccessOf = (
  studio: ActStudio | null,
  canEditStudio: boolean,
  screen: ActStudioScreen,
): ActScreenAccess => {
  if (studio === null) {
    return 'hub';
  }

  if (canEditStudio) {
    return 'open';
  }
  if (!canPractise(studio)) {
    return 'hub';
  }

  return screen === 'edit' ? 'practice' : 'open';
};
