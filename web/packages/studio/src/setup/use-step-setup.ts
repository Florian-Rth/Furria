import type { TimelineRange } from '@furria/studio/music-timeline';
import type { SetupProgress, TimedStep } from '@furria/studio/setup-progress';
import { setupProgressOf, stepsInRangeOf, timedStepsOf } from '@furria/studio/setup-progress';
import type {
  SetupFacts,
  SetupPlace,
  SetupStage,
  StageCell,
  StageGate,
} from '@furria/studio/setup-stages';
import {
  leaveGateOf,
  nextPlaceOf,
  previousStageOf,
  stageCellsOf,
  stageGateOf,
} from '@furria/studio/setup-stages';
import type { AudioPeaks, StudioVideo } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { clipSpanOf } from '@furria/studio/studio-videos';
import { useState } from 'react';

export interface StepSetupPort {
  videoId: number | null;
  chooseVideoId: (videoId: number | null) => void;
  videoPeaks: ReadonlyMap<number, AudioPeaks>;
  leave: () => void;
}

export interface StepSetup {
  screen: StudioScreen;
  stage: SetupPlace;
  cells: StageCell[];
  facts: SetupFacts;
  leaveGate: StageGate;
  steps: TimedStep[];
  video: StudioVideo | null;
  videoPeaks: ReadonlyMap<number, AudioPeaks>;
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

const placedOf = (video: StudioVideo): boolean =>
  video.state === 'ready' && video.placement === 'onTimeline' && video.startSeconds !== null;

export const useStepSetup = (screen: StudioScreen, port: StepSetupPort): StepSetup => {
  const { videoId, chooseVideoId: setVideoId } = port;
  const { playback, studio } = screen;
  const { player } = playback;
  const steps = timedStepsOf(playback.steps);
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
    videoPeaks: port.videoPeaks,
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
      port.leave();
    },
  };
};
