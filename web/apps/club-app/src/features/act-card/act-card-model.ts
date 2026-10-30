import type { MyAct, Studio, StudioEvening, StudioTraining } from '@/features/acts/schemas';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import type { ActKind } from '@/features/running-order/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';

export type ActTemplate = 'studio' | 'spoken' | 'point';
export type DoorKey = 'evening' | 'training' | 'practice' | 'cast' | 'text';
export type AnswerKey = 'yes' | 'no';

export interface PlacedSlot {
  kind: 'placed';
  number: number;
}

export type EveningSlot = PlacedSlot | { kind: 'unplaced' } | { kind: 'absent' };

export interface Tally {
  present: number;
  absent: number;
  of: number;
}

export interface NamesPreview {
  names: string[];
  more: number;
}

export interface StudioCounts {
  musicSeconds: number;
  finalTrack: boolean;
  songs: number;
  steps: number;
  placedSteps: number;
  parts: string[];
  spots: number;
  openSpots: number;
  videos: number;
  outdatedVideos: number;
}

export interface HubBand {
  evening: EveningSlot;
  eveningStartsAt: string | null;
  training: { startsAt: string; answer: AnswerKey | null } | null;
  playable: boolean;
}

const EVENING_GRACE_MS = 6 * 60 * 60 * 1000;
const TRAINING_GRACE_MS = 2 * 60 * 60 * 1000;
const SECONDS_PER_MINUTE = 60;

const TEMPLATES: Record<ActKind, ActTemplate> = {
  dance: 'studio',
  show: 'studio',
  speech: 'spoken',
  music: 'spoken',
  point: 'point',
};

const DOORS: Record<ActTemplate, DoorKey[]> = {
  studio: ['evening', 'training', 'practice', 'cast'],
  spoken: ['evening', 'cast', 'text'],
  point: ['evening'],
};

export const templateOf = (kind: ActKind | null): ActTemplate =>
  kind === null ? 'studio' : TEMPLATES[kind];

const OUTSIDE_DOORS: DoorKey[] = ['cast'];

export const doorsOf = (template: ActTemplate, hasStudio: boolean): DoorKey[] =>
  hasStudio ? DOORS[template] : OUTSIDE_DOORS;

export const isDoorKey = (value: string, doors: readonly DoorKey[]): value is DoorKey =>
  doors.some((door) => door === value);

export const eveningSlotOf = (position: number | null | undefined): EveningSlot => {
  if (position === undefined) {
    return { kind: 'absent' };
  }

  return position === null ? { kind: 'unplaced' } : { kind: 'placed', number: position + 1 };
};

const isAhead = (startsAt: string, now: number, graceMs: number): boolean =>
  Date.parse(startsAt) + graceMs >= now;

const byStart = (left: { startsAt: string }, right: { startsAt: string }): number =>
  Date.parse(left.startsAt) - Date.parse(right.startsAt);

export const upcomingEveningsOf = (
  evenings: readonly StudioEvening[],
  now: number,
): StudioEvening[] =>
  evenings.filter((evening) => isAhead(evening.startsAt, now, EVENING_GRACE_MS)).sort(byStart);

export const upcomingTrainingsOf = (
  trainings: readonly StudioTraining[],
  now: number,
): StudioTraining[] =>
  trainings.filter((training) => isAhead(training.startsAt, now, TRAINING_GRACE_MS)).sort(byStart);

export const viewerAnswerOf = (
  training: StudioTraining,
  viewerId: number | null,
): AttendanceAnswer | null =>
  training.responses.find((response) => response.personId === viewerId)?.answer ?? null;

export const answerKeyOf = (answer: AttendanceAnswer | null | undefined): AnswerKey | null =>
  answer === 'yes' || answer === 'no' ? answer : null;

export const tallyOf = (present: number, absent: number, castSize: number): Tally | null =>
  present + absent === 0 ? null : { present, absent, of: castSize };

export const trainingTallyOf = (training: StudioTraining, castSize: number): Tally | null =>
  tallyOf(
    training.responses.filter((response) => response.answer === 'yes').length,
    training.responses.filter((response) => response.answer === 'no').length,
    castSize,
  );

export const namesPreviewOf = (
  people: readonly PortraitPersonRef[],
  shown: number,
): NamesPreview => ({
  names: people.slice(0, shown).map((person) => person.firstName),
  more: Math.max(people.length - shown, 0),
});

export type Ask = { kind: 'names'; names: string[] } | { kind: 'self' } | { kind: 'nobody' };

export const askOf = (editors: readonly PortraitPersonRef[], viewerId: number | null): Ask => {
  const names = askNamesOf(editors, viewerId);

  if (names.length > 0) {
    return { kind: 'names', names };
  }

  return editors.some((editor) => editor.personId === viewerId)
    ? { kind: 'self' }
    : { kind: 'nobody' };
};

export const askNamesOf = (
  editors: readonly PortraitPersonRef[],
  viewerId: number | null,
): string[] =>
  editors.filter((editor) => editor.personId !== viewerId).map((editor) => editor.firstName);

export const musicClockOf = (seconds: number): string => {
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const rest = whole % SECONDS_PER_MINUTE;

  return `${minutes}:${String(rest).padStart(2, '0')}`;
};

export const studioCountsOf = (studio: Studio): StudioCounts => ({
  musicSeconds: studio.music.lengthSeconds,
  finalTrack: studio.music.source === 'finalTrack',
  songs: studio.songs.length,
  steps: studio.steps.length,
  placedSteps: studio.steps.filter((step) => step.placement === 'onTimeline').length,
  parts: studio.parts.map((part) => part.name),
  spots: studio.spots.length,
  openSpots: studio.spots.filter((spot) => spot.person === null).length,
  videos: studio.videos.length,
  outdatedVideos: studio.videos.filter((video) => video.outdated).length,
});

export const hubBandOf = (act: MyAct): HubBand => ({
  evening: eveningSlotOf(act.nextEvening === null ? undefined : act.nextEvening.position),
  eveningStartsAt: act.nextEvening?.startsAt ?? null,
  training:
    act.nextTraining === null
      ? null
      : {
          startsAt: act.nextTraining.startsAt,
          answer: answerKeyOf(act.nextTraining.viewerAnswer),
        },
  playable: act.playable,
});

export const isOwed = (inCast: boolean, answer: AnswerKey | null): boolean =>
  inCast && answer === null;

export const isEditorOf = (canEditStudio: boolean, leads: boolean): boolean =>
  canEditStudio || leads;

export type DoorReach = 'tile' | 'full';

export const doorReachOf = (doors: readonly DoorKey[]): DoorReach =>
  doors.length === 1 ? 'full' : 'tile';

export const hasSheet = (door: DoorKey): boolean => door !== 'practice' && door !== 'text';

export const paneDoorOf = (open: DoorKey | null, doors: readonly DoorKey[]): DoorKey | null =>
  open !== null && hasSheet(open) ? open : (doors.find(hasSheet) ?? null);

export const sideDoorOf = (pane: DoorKey | null, doors: readonly DoorKey[]): DoorKey | null =>
  doors.find((door) => door !== pane && hasSheet(door)) ?? null;
