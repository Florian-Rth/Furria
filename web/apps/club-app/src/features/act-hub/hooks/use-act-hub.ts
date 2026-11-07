import { hallTrainingOf } from '@furria/studio/hall-scene';
import { practiceMemoryKeyOf } from '@furria/studio/practice-memory';
import { partAnchorOf } from '@furria/studio/score-anchor';
import { clockOf } from '@furria/studio/score-copy';
import type { LiveScene } from '@furria/studio/score-live';
import type { ScoreModel } from '@furria/studio/score-model';
import { scoreModelOf, stepOf } from '@furria/studio/score-model';
import type { ScoreStepTools } from '@furria/studio/score-step-tools';
import type { ScoreStep } from '@furria/studio/score-steps';
import type { ScoreGroupView, ScoreStepView, ScoreYouView } from '@furria/studio/score-views';
import {
  scoreGroupsOf,
  scoreStepViewOf,
  scoreYouOf,
  timedStepsOf,
  timelinePartsOf,
  timelineStepsOf,
} from '@furria/studio/score-views';
import { paneStepIdOf, rememberedStepOf } from '@furria/studio/score-you';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';
import type { ScorePlayer } from '@furria/studio/use-score-player';
import { useScorePlayer } from '@furria/studio/use-score-player';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import type { KkGroupTone } from '@furria/ui/group-tone';
import { useKkScoreWide } from '@furria/ui/KkScoreDesk';
import type { KkQuietScreenAction } from '@furria/ui/screen-declaration';
import { useState } from 'react';
import { useAudioPeaks } from '@/features/acts/api';
import type { ActPageSearch, ActStudio, ActStudioResponse } from '@/features/acts/schemas';
import { EDIT_LABEL, introOf, musicFactOf, sessionTextOf } from '../score-copy';
import { hasEditDoors, scoreDoorsOf } from '../score-doors';
import type {
  ScoreDoorView,
  ScoreEveningOpener,
  ScoreEveningView,
  ScoreFactsView,
  ScoreGo,
  ScoreReadinessOpener,
  ScoreReadinessView,
} from '../score-hub-views';
import { doorViewsOf, eveningViewsOf, factsViewOf, readinessViewsOf } from '../score-hub-views';
import { detailsLinkOf, eveningLinkOf, musicLinkOf } from '../score-links';
import { readinessOf } from '../score-readiness';
import { scrollToAnchor } from '../score-scroll';
import { actEveningsOf, nextEveningOf, nextTrainingOf } from '../score-season';
import type { ScoreRoute } from './use-score-route';
import { useScoreRoute } from './use-score-route';

export interface ActHub {
  actId: number;
  wide: boolean;
  reveal: boolean;
  tone: KkGroupTone | null;
  inCast: boolean;
  intro: string;
  model: ScoreModel;
  player: ScorePlayer;
  route: ScoreRoute;
  parts: TimelinePart[];
  steps: TimelineStep[];
  groups: ScoreGroupView[];
  you: ScoreYouView | null;
  readiness: ScoreReadinessView[];
  showReadiness: boolean;
  facts: ScoreFactsView;
  evenings: ScoreEveningView[];
  doors: ScoreDoorView[];
  pane: ScoreStepView | null;
  paneStepId: number | null;
  drawerStep: ScoreStepView | null;
  nowStep: ScoreStep | null;
  stepTools: ScoreStepTools;
  editOpen: boolean;
  actions: readonly [KkQuietScreenAction] | undefined;
  selectRow: (stepId: number) => void;
  selectPart: (partId: number) => void;
  practise: (() => void) | null;
  openTrainings: () => void;
}

const readStored = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
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
  const player = useScorePlayer(model, peaks);
  const route = useScoreRoute(actId, viewerId, search);
  useStudioKeys({ toggle: player.toggle }, wide);
  const editor = viewer.canEditStudio;
  const editDoors = hasEditDoors(viewer);
  const reveal = !wide || !editor;
  const picked = stepOf(model, search.stepId ?? null);
  const paneStepId = paneStepIdOf(
    picked?.stepId ?? null,
    player.activeStepId,
    timedStepsOf(model)[0]?.stepId ?? model.steps[0]?.stepId ?? null,
  );
  const paneStep = stepOf(model, paneStepId);
  const training = nextTrainingOf(studio.trainings, now);
  const evening = nextEveningOf(studio.evenings, now);
  const remembered = rememberedStepOf(model.steps, stored);
  const readiness = readinessOf(studio, model.steps);
  const go: ScoreGo = (link) => () => {
    route.go(link);
  };
  const openEvening: ScoreEveningOpener | null = editor
    ? (eventId) => go(eveningLinkOf(actId, eventId))
    : null;
  const openReadiness: ScoreReadinessOpener | null = editor
    ? (target) => (target === 'music' ? go(musicLinkOf(actId)) : () => route.editFrom(paneStepId))
    : null;
  const doors = scoreDoorsOf(viewer, {
    actId,
    nextEveningId: evening?.eventId ?? null,
    hallTrainingId:
      training?.calendarEntryId ??
      hallTrainingOf(studio.trainings, undefined)?.calendarEntryId ??
      null,
    playable: player.canPlay,
  });
  const scene: LiveScene = {
    paths: model.paths,
    spots: studio.spots,
    stage: model.stage,
    ownSpotId: model.ownSpotId,
  };
  const music = model.length > 0 ? musicFactOf(studio.music.source, model.length) : null;

  const selectRow = (stepId: number): void => {
    route.showStep(stepId);
    const range = stepOf(model, stepId)?.range ?? null;
    if (wide && range !== null) {
      player.seekTo(range.start);
    }
  };

  const selectPart = (partId: number): void => {
    const range = model.parts.find((candidate) => candidate.partId === partId)?.range ?? null;
    if (range !== null && !player.playing) {
      player.seekTo(range.start);
    }
    scrollToAnchor(partAnchorOf(partId));
  };

  return {
    actId,
    wide,
    reveal,
    tone: data.act.group?.tone ?? null,
    inCast: viewer.inCast,
    intro: introOf([
      data.act.group?.name ?? null,
      data.act.sessionYear === null ? null : sessionTextOf(data.act.sessionYear),
      model.length > 0 ? clockOf(model.length) : null,
    ]),
    model,
    player,
    route,
    parts: timelinePartsOf(model),
    steps: timelineStepsOf(model),
    groups: scoreGroupsOf(model, reveal),
    you: viewer.inCast ? scoreYouOf(model, studio.spots, remembered) : null,
    readiness: readinessViewsOf(readiness, openReadiness),
    showReadiness: editDoors && readiness.some((item) => item.state !== 'empty'),
    facts: factsViewOf({ training, evening, viewerId, music }, openEvening),
    evenings: eveningViewsOf(actEveningsOf(studio.evenings, now), openEvening),
    doors: doorViewsOf(doors, go),
    pane: wide && paneStep !== null ? scoreStepViewOf(paneStep, model, studio) : null,
    paneStepId: wide ? paneStepId : null,
    drawerStep: !wide && picked !== null ? scoreStepViewOf(picked, model, studio) : null,
    nowStep: stepOf(model, player.activeStepId) ?? paneStep,
    stepTools: {
      scene,
      player: player.player,
      practiseFrom: player.canPlay ? route.practiseFrom : null,
      editFrom: editor ? route.editFrom : null,
    },
    editOpen: editDoors && search.sheet === 'edit',
    actions: editDoors
      ? [{ id: 'edit', label: EDIT_LABEL, icon: 'edit', onSelect: route.openEdit }]
      : undefined,
    selectRow,
    selectPart,
    practise: player.canPlay
      ? () => {
          route.practiseFrom(remembered?.stepId ?? null);
        }
      : null,
    openTrainings: go(detailsLinkOf(actId)),
  };
};
