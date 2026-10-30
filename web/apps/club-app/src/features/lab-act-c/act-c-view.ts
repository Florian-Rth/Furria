import type {
  ActStudioResponse,
  CoEditor,
  MyAct,
  StudioEvening,
  StudioTraining,
} from '@/features/acts/schemas';
import type { ActKind, ActWish } from '@/features/running-order/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';
import type {
  ActTemplate,
  AnswerKey,
  Ask,
  DoorKey,
  EveningSlot,
  StudioCounts,
  Tally,
} from './act-c-model';
import {
  answerKeyOf,
  askOf,
  doorsOf,
  eveningSlotOf,
  isEditorOf,
  studioCountsOf,
  tallyOf,
  templateOf,
  trainingTallyOf,
  upcomingEveningsOf,
  upcomingTrainingsOf,
  viewerAnswerOf,
} from './act-c-model';

export interface NextEvening {
  eventId: number;
  title: string;
  startsAt: string;
  slot: EveningSlot;
}

export interface NextTraining {
  calendarEntryId: number;
  startsAt: string;
  answer: AnswerKey | null;
  tally: Tally | null;
}

export interface ActCView {
  actId: number;
  name: string;
  kind: ActKind | null;
  sessionYear: number | null;
  group: { groupId: number; name: string } | null;
  template: ActTemplate;
  doors: DoorKey[];
  viewerId: number | null;
  inCast: boolean;
  editor: boolean;
  canEditStudio: boolean;
  canEditSettings: boolean;
  hasStudio: boolean;
  evenings: StudioEvening[];
  nextEvening: NextEvening | null;
  trainings: StudioTraining[];
  nextTraining: NextTraining | null;
  cast: PortraitPersonRef[];
  editors: PortraitPersonRef[];
  ask: Ask;
  playable: boolean;
  counts: StudioCounts | null;
  coEditors: CoEditor[];
  wishes: ActWish[];
}

const nextEveningOf = (
  summary: MyAct | undefined,
  evenings: readonly StudioEvening[],
): NextEvening | null => {
  if (summary?.nextEvening != null) {
    const { eventId, title, startsAt, position, stageStartsAt } = summary.nextEvening;

    return { eventId, title, startsAt, slot: eveningSlotOf(position, stageStartsAt) };
  }

  const first = evenings.find((evening) => evening.appearance !== null);

  return first === undefined
    ? null
    : {
        eventId: first.eventId,
        title: first.title,
        startsAt: first.startsAt,
        slot: eveningSlotOf(
          first.appearance?.position ?? null,
          first.appearance?.stageStartsAt ?? null,
        ),
      };
};

const nextTrainingOf = (
  summary: MyAct | undefined,
  trainings: readonly StudioTraining[],
  viewerId: number | null,
  castSize: number,
): NextTraining | null => {
  if (summary?.nextTraining != null) {
    const { calendarEntryId, startsAt, viewerAnswer, present, absent } = summary.nextTraining;

    return {
      calendarEntryId,
      startsAt,
      answer: answerKeyOf(viewerAnswer),
      tally: tallyOf(present, absent, castSize),
    };
  }

  const [first] = trainings;

  return first === undefined
    ? null
    : {
        calendarEntryId: first.calendarEntryId,
        startsAt: first.startsAt,
        answer: answerKeyOf(viewerAnswerOf(first, viewerId)),
        tally: trainingTallyOf(first, castSize),
      };
};

export const actCViewOf = (
  data: ActStudioResponse,
  summary: MyAct | undefined,
  viewerId: number | null,
  now: number,
): ActCView => {
  const { act, viewer, studio } = data;
  const template = templateOf(act.kind);
  const evenings = studio === null ? [] : upcomingEveningsOf(studio.evenings, now);
  const trainings = studio === null ? [] : upcomingTrainingsOf(studio.trainings, now);
  const leads = summary?.viewerLeads ?? false;
  const editors = summary?.editors ?? [];

  return {
    actId: act.actId,
    name: act.name,
    kind: act.kind,
    sessionYear: act.sessionYear,
    group: act.group === null ? null : { groupId: act.group.groupId, name: act.group.name },
    template,
    doors: doorsOf(template),
    viewerId,
    inCast: viewer.inCast,
    editor: isEditorOf(viewer.canEditStudio, leads),
    canEditStudio: viewer.canEditStudio,
    canEditSettings: viewer.canEditSettings,
    hasStudio: studio !== null,
    evenings,
    nextEvening: nextEveningOf(summary, evenings),
    trainings,
    nextTraining: nextTrainingOf(summary, trainings, viewerId, act.cast.length),
    cast: act.cast,
    editors,
    ask: askOf(editors, viewerId),
    playable: summary?.playable ?? (studio !== null && studio.music.lengthSeconds > 0),
    counts: studio === null ? null : studioCountsOf(studio),
    coEditors: data.coEditors,
    wishes: act.wishes,
  };
};
