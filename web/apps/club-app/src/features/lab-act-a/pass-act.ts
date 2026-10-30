import { canPractise } from '@/features/acts/act-studio';
import type {
  ActStudioResponse,
  GroupAct,
  MyAct,
  MyActEvening,
  MyActTraining,
  StudioEvening,
  StudioSpot,
  StudioTraining,
} from '@/features/acts/schemas';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import type { ActKind } from '@/features/running-order/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';

export type PassTemplate = 'studio' | 'spoken' | 'point';

export const shownAnswerOf = (
  saved: AttendanceAnswer | null,
  chosen: AttendanceAnswer | null,
  failed: boolean,
): AttendanceAnswer | null => (failed || chosen === null ? saved : chosen);
export type PassCastRole = 'cast' | 'speakers' | 'performers';

export type PassSlot =
  | { kind: 'none' }
  | { kind: 'pending'; eventId: number; title: string; startsAt: string }
  | {
      kind: 'placed';
      eventId: number;
      title: string;
      startsAt: string;
      position: number;
      stageStartsAt: string | null;
    };

export type PassTraining =
  | { kind: 'none' }
  | {
      kind: 'answer';
      calendarEntryId: number;
      title: string;
      startsAt: string;
      answer: AttendanceAnswer | null;
      owed: boolean;
    }
  | {
      kind: 'tally';
      calendarEntryId: number;
      title: string;
      startsAt: string;
      present: number;
      absent: number;
    };

export type PassPractice =
  | { kind: 'hidden' }
  | { kind: 'open' }
  | { kind: 'silent'; askNames: string[] };

export interface PassCastMember {
  person: PortraitPersonRef;
  own: boolean;
}

export interface PassEveningLine {
  eventId: number;
  title: string;
  startsAt: string;
  position: number | null;
  stageStartsAt: string | null;
}

export interface PassTrainingLine {
  calendarEntryId: number;
  title: string;
  startsAt: string;
  answer: AttendanceAnswer | null;
}

export interface PassGroupActs {
  cards: MyAct[];
  rows: GroupAct[];
}

export const passTemplateOf = (kind: ActKind | null, playable: boolean): PassTemplate => {
  if (kind === 'point') {
    return 'point';
  }
  if (kind === 'dance' || kind === 'show') {
    return 'studio';
  }
  if (kind === null && playable) {
    return 'studio';
  }

  return 'spoken';
};

export const castRoleOf = (kind: ActKind | null): PassCastRole => {
  if (kind === 'speech') {
    return 'speakers';
  }

  return kind === 'music' ? 'performers' : 'cast';
};

export const passSlotOf = (evening: MyActEvening | null): PassSlot => {
  if (evening === null) {
    return { kind: 'none' };
  }
  if (evening.position === null) {
    return {
      kind: 'pending',
      eventId: evening.eventId,
      title: evening.title,
      startsAt: evening.startsAt,
    };
  }

  return {
    kind: 'placed',
    eventId: evening.eventId,
    title: evening.title,
    startsAt: evening.startsAt,
    position: evening.position,
    stageStartsAt: evening.stageStartsAt,
  };
};

export const passTrainingOf = (
  training: MyActTraining | null,
  viewerInCast: boolean,
): PassTraining => {
  if (training === null) {
    return { kind: 'none' };
  }
  if (!viewerInCast) {
    return {
      kind: 'tally',
      calendarEntryId: training.calendarEntryId,
      title: training.title,
      startsAt: training.startsAt,
      present: training.present,
      absent: training.absent,
    };
  }

  return {
    kind: 'answer',
    calendarEntryId: training.calendarEntryId,
    title: training.title,
    startsAt: training.startsAt,
    answer: training.viewerAnswer,
    owed: training.viewerAnswer === null || training.viewerAnswer === 'maybe',
  };
};

export const passPracticeOf = (
  template: PassTemplate,
  playable: boolean,
  editors: readonly PortraitPersonRef[],
  viewerId: number | null,
): PassPractice => {
  if (template !== 'studio') {
    return { kind: 'hidden' };
  }
  if (playable) {
    return { kind: 'open' };
  }

  return {
    kind: 'silent',
    askNames: editors
      .filter((editor) => editor.personId !== viewerId)
      .map((editor) => editor.firstName),
  };
};

export const passCastOf = (
  cast: readonly PortraitPersonRef[],
  viewerId: number | null,
): PassCastMember[] => {
  const members = cast.map((person) => ({ person, own: person.personId === viewerId }));

  return [...members.filter((member) => member.own), ...members.filter((member) => !member.own)];
};

export const canOpenDetails = (
  act: Pick<MyAct, 'viewerLeads' | 'editors'>,
  viewerId: number | null,
  canEditStudio: boolean,
): boolean =>
  act.viewerLeads || canEditStudio || act.editors.some((editor) => editor.personId === viewerId);

export const laterEveningsOf = (
  evenings: readonly StudioEvening[],
  shownEventId: number | null,
): PassEveningLine[] =>
  evenings
    .filter((evening) => evening.appearance !== null && evening.eventId !== shownEventId)
    .toSorted((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt))
    .map((evening) => ({
      eventId: evening.eventId,
      title: evening.title,
      startsAt: evening.startsAt,
      position: evening.appearance?.position ?? null,
      stageStartsAt: evening.appearance?.stageStartsAt ?? null,
    }));

const viewerAnswerOf = (
  training: StudioTraining,
  viewerId: number | null,
): AttendanceAnswer | null =>
  training.responses.find((response) => response.personId === viewerId)?.answer ?? null;

export const laterTrainingsOf = (
  trainings: readonly StudioTraining[],
  shownCalendarEntryId: number | null,
  viewerId: number | null,
): PassTrainingLine[] =>
  trainings
    .filter((training) => training.calendarEntryId !== shownCalendarEntryId)
    .toSorted((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt))
    .map((training) => ({
      calendarEntryId: training.calendarEntryId,
      title: training.title,
      startsAt: training.startsAt,
      answer: viewerAnswerOf(training, viewerId),
    }));

const firstAppearanceOf = (evenings: readonly StudioEvening[]): MyActEvening | null => {
  const evening = evenings
    .filter((candidate) => candidate.appearance !== null)
    .toSorted((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt))[0];

  if (evening === undefined) {
    return null;
  }

  return {
    eventId: evening.eventId,
    title: evening.title,
    startsAt: evening.startsAt,
    position: evening.appearance?.position ?? null,
    stageStartsAt: evening.appearance?.stageStartsAt ?? null,
  };
};

const firstTrainingOf = (
  trainings: readonly StudioTraining[],
  viewerId: number | null,
): MyActTraining | null => {
  const training = trainings.toSorted(
    (left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt),
  )[0];

  if (training === undefined) {
    return null;
  }

  return {
    calendarEntryId: training.calendarEntryId,
    title: training.title,
    startsAt: training.startsAt,
    viewerAnswer: viewerAnswerOf(training, viewerId),
    present: training.responses.filter((response) => response.answer === 'yes').length,
    absent: training.responses.filter((response) => response.answer === 'no').length,
  };
};

export const myActOfStudio = (response: ActStudioResponse, viewerId: number | null): MyAct => {
  const { act, viewer, coEditors, studio } = response;

  return {
    actId: act.actId,
    name: act.name,
    kind: act.kind,
    sessionYear: act.sessionYear ?? 0,
    group: act.group,
    viewerInCast: viewer.inCast,
    viewerLeads: viewer.canEditSettings,
    playable: canPractise(studio),
    cast: act.cast,
    editors: coEditors,
    nextEvening: studio === null ? null : firstAppearanceOf(studio.evenings),
    nextTraining: studio === null ? null : firstTrainingOf(studio.trainings, viewerId),
  };
};

export const passActOf = (
  actId: number | null,
  mine: readonly MyAct[] | undefined,
  studio: ActStudioResponse | undefined,
  viewerId: number | null,
): MyAct | null => {
  const own = mine?.find((act) => act.actId === actId);

  if (own !== undefined) {
    return own;
  }

  return studio === undefined ? null : myActOfStudio(studio, viewerId);
};

const isCardAct = (act: MyAct): boolean => act.viewerInCast || act.viewerLeads;

export const groupActsOf = (
  groupActs: readonly GroupAct[],
  mine: readonly MyAct[],
  groupId: number,
): PassGroupActs => {
  const cards = mine.filter((act) => act.group?.groupId === groupId && isCardAct(act));
  const carded = new Set(cards.map((act) => act.actId));
  const rows = groupActs.filter((act) => !act.closed && !carded.has(act.actId));

  return { cards, rows };
};

export const ownSpotOf = (spots: readonly StudioSpot[], viewerId: number | null): number | null =>
  viewerId === null
    ? null
    : (spots.find((spot) => spot.person?.personId === viewerId)?.number ?? null);
