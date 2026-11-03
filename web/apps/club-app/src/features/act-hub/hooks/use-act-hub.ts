import { practiceMemoryKeyOf } from '@furria/studio/practice-memory';
import { partAnchorOf } from '@furria/studio/score-anchor';
import { clockOf } from '@furria/studio/score-copy';
import type { ScoreHub } from '@furria/studio/score-hub';
import { scoreModelOf } from '@furria/studio/score-model';
import type { ScoreStepView } from '@furria/studio/score-views';
import {
  scoreGroupsOf,
  scoreStepViewOf,
  scoreYouOf,
  timedStepsOf,
  timelinePartsOf,
  timelineStepsOf,
} from '@furria/studio/score-views';
import { paneStepIdOf, rememberedStepOf } from '@furria/studio/score-you';
import { useScorePlayer } from '@furria/studio/use-score-player';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import type { KkIconName } from '@furria/ui/KkIcon';
import { useKkScoreWide } from '@furria/ui/KkScoreDesk';
import type { KkScoreReadinessState } from '@furria/ui/KkScoreReadiness';
import type { KkQuietScreenAction } from '@furria/ui/screen-declaration';
import { useState } from 'react';
import { useAudioPeaks } from '@/features/acts/api';
import type {
  ActPageSearch,
  ActStudio,
  ActStudioResponse,
  StudioTraining,
} from '@/features/acts/schemas';
import {
  dayOf,
  EDIT_LABEL,
  eveningFactOf,
  eveningHintOf,
  introOf,
  musicFactOf,
  readinessHintOf,
  readinessLabelOf,
  readinessValueOf,
  sessionTextOf,
} from '../score-copy';
import type { ScoreDoor } from '../score-doors';
import { hasEditDoors, scoreDoorsOf } from '../score-doors';
import type { ScoreLink } from '../score-links';
import { detailsLinkOf, eveningLinkOf, musicLinkOf } from '../score-links';
import type { ReadinessKey } from '../score-readiness';
import { readinessOf } from '../score-readiness';
import { scrollToAnchor } from '../score-scroll';
import { actEveningsOf, eveningNumberOf, nextEveningOf, nextTrainingOf } from '../score-season';
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

export interface ScoreReadinessView {
  key: ReadinessKey;
  icon: KkIconName;
  label: string;
  value: string;
  hint: string;
  state: KkScoreReadinessState;
  open: (() => void) | null;
}

export interface ScoreFactsView {
  training: StudioTraining | null;
  trainingAnswer: 'yes' | 'no' | null;
  evening: string | null;
  eveningOpen: (() => void) | null;
  music: string | null;
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

export interface ActHub extends ScoreHub {
  actId: number;
  inCast: boolean;
  intro: string;
  data: ActStudioResponse;
  studio: ActStudio;
  route: ScoreRoute;
  readiness: ScoreReadinessView[];
  showReadiness: boolean;
  facts: ScoreFactsView;
  evenings: ScoreEveningView[];
  doors: ScoreDoorView[];
  pane: ScoreStepView | null;
  editOpen: boolean;
  actions: readonly [KkQuietScreenAction] | undefined;
  openTrainings: () => void;
}

const readStored = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const answerOf = (
  training: StudioTraining | null,
  viewerId: number | null,
): 'yes' | 'no' | null => {
  const answer = training?.responses.find((response) => response.personId === viewerId)?.answer;

  return answer === 'yes' || answer === 'no' ? answer : null;
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
  const peaks = useAudioPeaks(model.segments);
  const player = useScorePlayer(model, wide, peaks);
  const route = useScoreRoute(actId, viewerId, search);
  useStudioKeys({ toggle: player.toggle }, wide);
  const editor = viewer.canEditStudio;
  const reveal = !wide || !editor;
  const timed = timedStepsOf(model);
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
  const readiness = readinessOf(studio, model.steps);
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
    parts: timelinePartsOf(model),
    steps: timelineStepsOf(model),
    groups: scoreGroupsOf(model, reveal),
    readiness: readiness.map((item) => ({
      key: item.key,
      icon: READINESS_ICONS[item.key],
      label: readinessLabelOf(item.key),
      value: readinessValueOf(item),
      hint: readinessHintOf(item),
      state: item.state,
      open: editor ? openReadiness(item.target) : null,
    })),
    showReadiness: hasEditDoors(viewer) && readiness.some((item) => item.state !== 'empty'),
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
    you: viewer.inCast ? scoreYouOf(model, studio.spots, remembered) : null,
    evenings: actEveningsOf(studio.evenings, now).map((entry) => ({
      eventId: entry.eventId,
      number: entry.number === null ? null : String(entry.number),
      title: entry.title,
      date: dayOf(entry.startsAt),
      hint: eveningHintOf(entry.title, entry.number, entry.startsAt),
      open: editor ? go(eveningLinkOf(actId, entry.eventId)) : null,
    })),
    doors: doors.map((door) => ({ key: door.key, open: go(door.link) })),
    pane: wide && paneStep !== null ? scoreStepViewOf(paneStep, model, studio) : null,
    paneStepId: wide ? paneStepId : null,
    drawerStep: !wide && picked !== null ? scoreStepViewOf(picked, model, studio) : null,
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
    practiseFrom: route.practiseFrom,
    editFrom: route.editFrom,
    closeStep: route.closeStep,
  };
};
