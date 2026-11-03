import { practiceMemoryKeyOf } from '@furria/studio/practice-memory';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import type { KkGroupTone } from '@furria/ui/group-tone';
import type { KkIconName } from '@furria/ui/KkIcon';
import { useKkScoreWide } from '@furria/ui/KkScoreDesk';
import type { KkScoreReadinessState } from '@furria/ui/KkScoreReadiness';
import type { KkQuietScreenAction } from '@furria/ui/screen-declaration';
import { useState } from 'react';
import type {
  ActPageSearch,
  ActStudio,
  ActStudioResponse,
  StudioTraining,
} from '@/features/acts/schemas';
import { partAnchorOf, scrollToAnchor } from '../score-anchor';
import {
  clockOf,
  countsTextOf,
  dayOf,
  EDIT_LABEL,
  eveningFactOf,
  eveningHintOf,
  flagTextOf,
  glyphsLabelOf,
  introOf,
  LOOSE_STEPS,
  musicFactOf,
  partHintOf,
  partRangeTextOf,
  practiseMetaOf,
  rangeTextOf,
  readinessHintOf,
  readinessLabelOf,
  readinessValueOf,
  sessionTextOf,
  stepContextOf,
  stepTitleOf,
} from '../score-copy';
import type { ScoreDoor } from '../score-doors';
import { hasEditDoors, scoreDoorsOf } from '../score-doors';
import { enteringDotsOf, entranceDelayOf } from '../score-entrance';
import type { FormationDot, ScoreDot } from '../score-formation';
import type { ScoreLink } from '../score-links';
import { detailsLinkOf, eveningLinkOf, musicLinkOf } from '../score-links';
import type { ScoreModel } from '../score-model';
import { scoreModelOf } from '../score-model';
import type { ReadinessKey } from '../score-readiness';
import { actEveningsOf, eveningNumberOf, nextEveningOf, nextTrainingOf } from '../score-season';
import type { ScoreStep } from '../score-steps';
import { paneStepIdOf, rememberedStepOf } from '../score-you';
import type { ScorePlayer } from './use-score-player';
import { useScorePlayer } from './use-score-player';
import type { ScoreRoute } from './use-score-route';
import { useScoreRoute } from './use-score-route';

const READINESS_ICONS: Record<ReadinessKey, KkIconName> = {
  music: 'music',
  steps: 'list',
  places: 'group',
  movement: 'timeline',
  video: 'play',
  final: 'flag',
};

export interface ScoreRowView {
  stepId: number;
  label: string;
  number: number;
  title: string;
  meta: string;
  dots: ScoreDot[];
  entranceDelay: number | null;
  movement: boolean;
  video: boolean;
  flag: string | null;
}

export interface ScoreGroupView {
  key: number;
  anchor: string | undefined;
  title: string;
  meta: string;
  shade: number | null;
  rows: ScoreRowView[];
}

export interface ScoreReadinessView {
  key: ReadinessKey;
  icon: KkIconName;
  label: string;
  value: string;
  hint: string;
  state: KkScoreReadinessState;
  open: (() => void) | null;
}

export interface ScoreStepView {
  step: ScoreStep;
  title: string;
  context: string;
  dots: ScoreDot[];
  videoSource: string | null;
  videoPoster: string | null;
  videoName: string | null;
}

export interface ScoreFactsView {
  training: StudioTraining | null;
  trainingAnswer: 'yes' | 'no' | null;
  evening: string | null;
  eveningOpen: (() => void) | null;
  music: string | null;
}

export interface ScoreYouView {
  place: number | null;
  dots: ScoreDot[];
  practiseMeta: string | null;
}

export interface ScoreEveningView {
  eventId: number;
  number: string | null;
  title: string;
  date: string;
  hint: string;
  open: (() => void) | null;
}

export interface ScoreDoorView {
  key: ScoreDoor['key'];
  open: () => void;
}

export interface ActHub {
  actId: number;
  wide: boolean;
  reveal: boolean;
  tone: KkGroupTone | null;
  inCast: boolean;
  canEditStudio: boolean;
  canPlay: boolean;
  intro: string;
  data: ActStudioResponse;
  studio: ActStudio;
  model: ScoreModel;
  player: ScorePlayer;
  route: ScoreRoute;
  parts: TimelinePart[];
  steps: TimelineStep[];
  groups: ScoreGroupView[];
  readiness: ScoreReadinessView[];
  showReadiness: boolean;
  facts: ScoreFactsView;
  you: ScoreYouView | null;
  evenings: ScoreEveningView[];
  doors: ScoreDoorView[];
  pane: ScoreStepView | null;
  paneStepId: number | null;
  drawerStep: ScoreStepView | null;
  nowStep: ScoreStep | null;
  editOpen: boolean;
  actions: readonly [KkQuietScreenAction] | undefined;
  selectRow: (stepId: number) => void;
  selectPart: (partId: number) => void;
  openTrainings: () => void;
  practise: () => void;
}

const readStored = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const shownDotsOf = (dots: readonly FormationDot[]): ScoreDot[] =>
  dots.map((dot) => ({
    id: dot.spotId,
    x: dot.x,
    y: dot.y,
    own: dot.own,
    open: dot.open,
    number: dot.number,
    caption: dot.firstName,
  }));

const stepLabelOf = (step: ScoreStep): string =>
  [
    `${step.number}. ${stepTitleOf(step.number, step.name)}`,
    rangeTextOf(step.range),
    glyphsLabelOf(step.movement, step.video !== null, step.flag),
  ]
    .filter((piece) => piece !== '')
    .join(', ');

const rowOf = (
  step: ScoreStep,
  model: ScoreModel,
  before: readonly FormationDot[] | null,
  entranceDelay: number | null,
): ScoreRowView => {
  const title = stepTitleOf(step.number, step.name);
  const dots = model.formations.get(step.stepId) ?? [];

  return {
    stepId: step.stepId,
    label: stepLabelOf(step),
    number: step.number,
    title,
    meta: [rangeTextOf(step.range), countsTextOf(step.counts)]
      .filter((piece) => piece !== '')
      .join(' · '),
    dots: enteringDotsOf(dots, before).map((dot) => ({
      id: dot.spotId,
      x: dot.x,
      y: dot.y,
      own: dot.own,
      open: dot.open,
      number: dot.number,
      caption: dot.firstName,
      fromX: dot.fromX,
      fromY: dot.fromY,
    })),
    entranceDelay,
    movement: step.movement,
    video: step.video !== null,
    flag: step.flag === null ? null : flagTextOf(step.flag),
  };
};

const stepViewOf = (step: ScoreStep, model: ScoreModel, studio: ActStudio): ScoreStepView => {
  const part = model.parts.find((candidate) => candidate.partId === step.partId) ?? null;
  const video = studio.videos.find((candidate) => candidate.videoId === step.video?.videoId);

  return {
    step,
    title: `${step.number} · ${stepTitleOf(step.number, step.name)}`,
    context: stepContextOf(rangeTextOf(step.range), countsTextOf(step.counts), part?.name ?? null),
    dots: shownDotsOf(model.formations.get(step.stepId) ?? []),
    videoSource: video?.urls.compact ?? null,
    videoPoster: video?.urls.poster ?? null,
    videoName: video?.name ?? null,
  };
};

const answerOf = (
  training: StudioTraining | null,
  viewerId: number | null,
): 'yes' | 'no' | null => {
  const answer = training?.responses.find((response) => response.personId === viewerId)?.answer;

  return answer === 'yes' || answer === 'no' ? answer : null;
};

const groupsOf = (model: ScoreModel, reveal: boolean): ScoreGroupView[] => {
  let index = 0;
  let before: readonly FormationDot[] | null = null;

  return model.groups.map((group) => ({
    key: group.part?.partId ?? 0,
    anchor: group.part === null ? undefined : partAnchorOf(group.part.partId),
    title: group.part?.name ?? LOOSE_STEPS,
    meta: partRangeTextOf(group.part?.range ?? null, group.steps.length),
    shade: group.part?.index ?? null,
    rows: group.steps.map((step) => {
      const row = rowOf(step, model, before, reveal ? entranceDelayOf(index) : null);
      const dots = model.formations.get(step.stepId) ?? [];
      before = dots.length === 0 ? before : dots;
      index += 1;

      return row;
    }),
  }));
};

export const useActHub = (
  data: ActStudioResponse,
  studio: ActStudio,
  search: ActPageSearch,
  viewerId: number | null,
): ActHub => {
  const [now] = useState(Date.now);
  const wide = useKkScoreWide();
  const actId = data.act.actId;
  const { viewer } = data;
  const [stored] = useState(() => readStored(practiceMemoryKeyOf(actId, viewerId)));
  const model = scoreModelOf(studio, viewerId);
  const player = useScorePlayer(model, wide);
  const route = useScoreRoute(actId, viewerId, search);
  useStudioKeys({ toggle: player.toggle }, wide);
  const editor = viewer.canEditStudio;
  const reveal = !wide || !editor;
  const timed = model.steps.filter((step) => step.range !== null);
  const picked = model.steps.find((step) => step.stepId === search.stepId) ?? null;
  const paneStepId = paneStepIdOf(
    picked?.stepId ?? null,
    player.activeStepId,
    timed[0]?.stepId ?? model.steps[0]?.stepId ?? null,
  );
  const paneStep = model.steps.find((step) => step.stepId === paneStepId) ?? null;
  const training = nextTrainingOf(studio.trainings, now);
  const evening = nextEveningOf(studio.evenings, now);
  const remembered = rememberedStepOf(model.steps, stored);
  const opening = timed[0] === undefined ? [] : (model.formations.get(timed[0].stepId) ?? []);
  const ownPlace = studio.spots.find((spot) => spot.spotId === model.ownSpotId)?.number ?? null;
  const go =
    (link: ScoreLink): (() => void) =>
    () => {
      route.go(link);
    };
  const openReadiness = (target: 'music' | 'editor'): (() => void) =>
    target === 'music' ? go(musicLinkOf(actId)) : () => route.editFrom(paneStepId);
  const doors = scoreDoorsOf(viewer, {
    actId,
    nextEveningId: evening?.eventId ?? null,
    nextTrainingId: training?.calendarEntryId ?? null,
    playable: player.canPlay,
  });
  const nowStep =
    model.steps.find((step) => step.stepId === player.activeStepId) ?? paneStep ?? null;

  const selectRow = (stepId: number): void => {
    route.showStep(stepId);
    const step = model.steps.find((candidate) => candidate.stepId === stepId);
    if (wide && step?.range !== null && step?.range !== undefined) {
      player.seekTo(step.range.start);
    }
  };

  const selectPart = (partId: number): void => {
    const part = model.parts.find((candidate) => candidate.partId === partId);
    if (part?.range !== null && part?.range !== undefined && !player.playing) {
      player.seekTo(part.range.start);
    }
    scrollToAnchor(partAnchorOf(partId));
  };

  return {
    actId,
    wide,
    reveal,
    tone: data.act.group?.tone ?? null,
    inCast: viewer.inCast,
    canEditStudio: editor,
    canPlay: player.canPlay,
    intro: introOf([
      data.act.group?.name ?? null,
      data.act.sessionYear === null ? null : sessionTextOf(data.act.sessionYear),
      model.length > 0 ? clockOf(model.length) : null,
    ]),
    data,
    studio,
    model,
    player,
    route,
    parts: model.parts.map((part) => ({
      key: part.partId,
      label: part.name,
      hint: partHintOf(part.name),
      range: part.range,
      shade: part.index,
    })),
    steps: timed.map((step) => ({
      key: step.stepId,
      number: step.number,
      name: stepTitleOf(step.number, step.name),
      label: stepLabelOf(step),
      range: step.range,
      movement: step.movement,
      video: step.video !== null,
    })),
    groups: groupsOf(model, reveal),
    readiness: model.readiness.map((item) => ({
      key: item.key,
      icon: READINESS_ICONS[item.key],
      label: readinessLabelOf(item.key),
      value: readinessValueOf(item),
      hint: readinessHintOf(item),
      state: item.state,
      open: editor ? openReadiness(item.target) : null,
    })),
    showReadiness: hasEditDoors(viewer) && model.readiness.some((item) => item.state !== 'empty'),
    facts: {
      training,
      trainingAnswer: answerOf(training, viewerId),
      evening:
        evening === null
          ? null
          : eveningFactOf(evening.title, eveningNumberOf(evening), evening.startsAt),
      eveningOpen: evening !== null && editor ? go(eveningLinkOf(actId, evening.eventId)) : null,
      music: model.length > 0 ? musicFactOf(studio.music.source, model.length) : null,
    },
    you: viewer.inCast
      ? {
          place: ownPlace,
          dots: shownDotsOf(opening),
          practiseMeta:
            remembered === null ? null : practiseMetaOf(remembered.number, remembered.name),
        }
      : null,
    evenings: actEveningsOf(studio.evenings, now).map((entry) => ({
      eventId: entry.eventId,
      number: entry.number === null ? null : String(entry.number),
      title: entry.title,
      date: dayOf(entry.startsAt),
      hint: eveningHintOf(entry.title, entry.number, entry.startsAt),
      open: editor ? go(eveningLinkOf(actId, entry.eventId)) : null,
    })),
    doors: doors.map((door) => ({ key: door.key, open: go(door.link) })),
    pane: wide && paneStep !== null ? stepViewOf(paneStep, model, studio) : null,
    paneStepId: wide ? paneStepId : null,
    drawerStep: !wide && picked !== null ? stepViewOf(picked, model, studio) : null,
    nowStep,
    editOpen: hasEditDoors(viewer) && search.sheet === 'edit',
    actions: hasEditDoors(viewer)
      ? [{ id: 'edit', label: EDIT_LABEL, icon: 'edit', onSelect: route.openEdit }]
      : undefined,
    selectRow,
    selectPart,
    openTrainings: go(detailsLinkOf(actId)),
    practise: () => {
      route.practiseFrom(remembered?.stepId ?? null);
    },
  };
};
