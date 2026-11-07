import type { HallTraining } from '@furria/studio/hall-scene';
import { hallTrainingOf } from '@furria/studio/hall-scene';

export const ACT_PRACTICE_PATH = '/acts/$actId/practice';
export const ACT_EDIT_PATH = '/acts/$actId/edit';
export const ACT_EVENING_PRACTICE_PATH = '/acts/$actId/evenings/$eventId/practice';
export const ACT_EVENING_EDIT_PATH = '/acts/$actId/evenings/$eventId/edit';
export const ACT_MUSIC_PATH = '/acts/$actId/music';
export const ACT_VIDEOS_PATH = '/acts/$actId/videos';
export const ACT_FREE_HALL_PATH = '/acts/$actId/training';
export const ACT_HALL_TRAINING_PATH = '/acts/$actId/trainings/$trainingId';
export const ACT_STEP_SETUP_PATH = '/acts/$actId/steps/setup';

export type ActScreen =
  | { kind: 'practice'; eventId: number | null }
  | { kind: 'edit'; eventId: number | null }
  | { kind: 'music' }
  | { kind: 'videos' }
  | { kind: 'training'; trainingId: number }
  | { kind: 'freeHall' }
  | { kind: 'stepSetup' };

export interface ActScreenLink {
  to: string;
  params: Record<string, string>;
}

const withEvening = (
  actId: string,
  eventId: number | null,
  sessionPath: string,
  eveningPath: string,
): ActScreenLink =>
  eventId === null
    ? { to: sessionPath, params: { actId } }
    : { to: eveningPath, params: { actId, eventId: String(eventId) } };

export const actScreenLinkOf = (actId: number, screen: ActScreen): ActScreenLink => {
  const id = String(actId);

  switch (screen.kind) {
    case 'practice':
      return withEvening(id, screen.eventId, ACT_PRACTICE_PATH, ACT_EVENING_PRACTICE_PATH);
    case 'edit':
      return withEvening(id, screen.eventId, ACT_EDIT_PATH, ACT_EVENING_EDIT_PATH);
    case 'music':
      return { to: ACT_MUSIC_PATH, params: { actId: id } };
    case 'videos':
      return { to: ACT_VIDEOS_PATH, params: { actId: id } };
    case 'training':
      return {
        to: ACT_HALL_TRAINING_PATH,
        params: { actId: id, trainingId: String(screen.trainingId) },
      };
    case 'freeHall':
      return { to: ACT_FREE_HALL_PATH, params: { actId: id } };
    case 'stepSetup':
      return { to: ACT_STEP_SETUP_PATH, params: { actId: id } };
  }
};

export const actScreenPathOf = (actId: number, screen: ActScreen): string => {
  const link = actScreenLinkOf(actId, screen);

  return Object.entries(link.params).reduce(
    (path, [name, value]) => path.replace(`$${name}`, value),
    link.to,
  );
};

export const switchedEditingOf = (screen: ActScreen): ActScreen => {
  if (screen.kind === 'practice') {
    return { kind: 'edit', eventId: screen.eventId };
  }

  return screen.kind === 'edit' ? { kind: 'practice', eventId: screen.eventId } : screen;
};

export const hallScreenOf = (trainingId: number | null): ActScreen =>
  trainingId === null ? { kind: 'freeHall' } : { kind: 'training', trainingId };

export const startedHallOf = (trainings: readonly HallTraining[]): ActScreen =>
  hallScreenOf(hallTrainingOf(trainings, undefined)?.calendarEntryId ?? null);
