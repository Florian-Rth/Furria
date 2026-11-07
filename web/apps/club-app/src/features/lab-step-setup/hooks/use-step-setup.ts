import type { TimelineRange } from '@furria/studio/music-timeline';
import type { StudioVideo } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { clipSpanOf } from '@furria/studio/studio-videos';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { SetupProgress, TimedStep } from '../setup-progress';
import { setupProgressOf, stepsInRangeOf } from '../setup-progress';
import type { SetupFacts, SetupPlace, SetupStage, StageCell, StageGate } from '../setup-stages';
import {
  leaveGateOf,
  nextPlaceOf,
  previousStageOf,
  stageCellsOf,
  stageGateOf,
} from '../setup-stages';

export interface StepSetup {
  screen: StudioScreen;
  stage: SetupPlace;
  cells: StageCell[];
  facts: SetupFacts;
  leaveGate: StageGate;
  steps: TimedStep[];
  video: StudioVideo | null;
  range: TimelineRange | null;
  videoSteps: TimedStep[];
  progress: SetupProgress;
  nextPlace: SetupPlace | null;
  go: (place: SetupPlace) => void;
  next: () => void;
  back: (() => void) | null;
  chooseVideo: (videoId: number | null) => void;
  adoptVideo: (videoId: number) => void;
  anotherVideo: () => void;
  leave: () => void;
}

const timedStepsOf = (screen: StudioScreen): TimedStep[] =>
  screen.playback.steps.flatMap((step) =>
    step.startSeconds === null || step.endSeconds === null
      ? []
      : [{ stepId: step.stepId, name: step.name, start: step.startSeconds, end: step.endSeconds }],
  );

const placedOf = (video: StudioVideo): boolean =>
  video.state === 'ready' && video.placement === 'onTimeline' && video.startSeconds !== null;

export const useStepSetup = (screen: StudioScreen, actId: number): StepSetup => {
  const navigate = useNavigate();
  const { playback, studio } = screen;
  const { player } = playback;
  const steps = timedStepsOf(screen);
  const [videoId, setVideoId] = useState<number | null>(null);
  const [place, setPlace] = useState<SetupPlace>('video');
  const video = studio.videos.find((candidate) => candidate.videoId === videoId) ?? null;
  const range = video === null ? null : clipSpanOf(video);
  const videoSteps = range === null ? [] : stepsInRangeOf(steps, range);
  const progress = setupProgressOf(videoSteps);
  const facts: SetupFacts = {
    hasMusic: playback.length > 0,
    videoChosen: video !== null,
    videoReady: video?.state === 'ready',
    videoPlaced: video !== null && placedOf(video),
    progress,
  };
  const shown: SetupPlace = stageGateOf(place, facts) === 'open' ? place : 'video';
  if (shown !== place) {
    setPlace(shown);
  }
  const settle = (): void => {
    player.pause();
    player.setLoop(null);
  };
  const go = (target: SetupPlace): void => {
    if (stageGateOf(target, facts) !== 'open' || target === shown) {
      return;
    }
    settle();
    setPlace(target);
  };
  const leaveGate = leaveGateOf(shown, facts);
  const previous = previousStageOf(shown);
  const stage: SetupStage | null = shown === 'finish' ? null : shown;

  return {
    screen,
    stage: shown,
    cells: stageCellsOf(shown, facts),
    facts,
    leaveGate,
    steps,
    video,
    range,
    videoSteps,
    progress,
    nextPlace: stage === null ? null : nextPlaceOf(stage),
    go,
    next: () => {
      if (stage !== null && leaveGate === 'open') {
        go(nextPlaceOf(stage));
      }
    },
    back:
      previous === null
        ? null
        : () => {
            go(previous);
          },
    chooseVideo: (id) => {
      settle();
      setVideoId(id);
    },
    adoptVideo: setVideoId,
    anotherVideo: () => {
      settle();
      setVideoId(null);
      setPlace('video');
    },
    leave: () => {
      settle();
      void navigate({ to: '/lab/edit-jobs/$actId', params: { actId: String(actId) } });
    },
  };
};
