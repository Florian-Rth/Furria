import type { KkHallAbsentPerson } from '@furria/ui/KkHall';
import { useEffect, useState } from 'react';
import { COUNT_IN_BEATS } from '@/features/act-player/count-in';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import { shownStepNameOf, stepNumberOf } from '@/features/act-player/step-names';
import { usePractice } from '@/features/act-practice/hooks/use-practice';
import { usePracticeKeys } from '@/features/act-practice/hooks/use-practice-keys';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { usePracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { stageSummaryOf } from '@/features/act-practice/practice-stage';
import { useScreenWakeLock } from '@/features/act-training/hooks/use-screen-wake-lock';
import { trainingStepMetaOf } from '@/features/act-training/training-copy';
import type { Studio, StudioTraining } from '@/features/acts/schemas';
import {
  HALL_NO_STEP,
  HALL_PAUSE,
  HALL_PLAY,
  hallAbsentNoneOf,
  hallAbsentTitleOf,
  hallNextOf,
  hallStageLabelOf,
  hallTempoCaptionOf,
} from '../hall-copy';
import type { HallScene } from '../hall-scene';
import { hallAbsencesOf, nextStepOf } from '../hall-scene';

const FULL_TEMPO = 1;
const HALL_TEMPO = 0.75;
const HALL_RATES: readonly number[] = [HALL_TEMPO, FULL_TEMPO];
const NO_COUNT_IN = 0;
const NO_VIEWER = null;
const DANCERS_VIEW: StageViewpoint = 'dancers';

export interface Hall {
  playback: StudioPlayback;
  scene: HallScene;
  video: PracticeVideo;
  stageLabel: string;
  stepName: string;
  stepMeta: string | null;
  next: string;
  absentTitle: string;
  absentNone: string;
  absences: KkHallAbsentPerson[];
  playing: boolean;
  playCaption: string;
  canPlay: boolean;
  canStep: boolean;
  looping: boolean;
  slowed: boolean;
  tempoCaption: string;
  countingIn: boolean;
  videoOn: boolean;
  hasVideo: boolean;
  toggle: () => void;
  back: () => void;
  forward: () => void;
  loop: () => void;
  tempo: () => void;
  toggleCountIn: () => void;
  toggleVideo: () => void;
}

export const useHall = (studio: Studio, training: StudioTraining | null): Hall => {
  useScreenWakeLock();
  const playback = useStudioPlayback(studio, NO_VIEWER);
  const practice = usePractice(playback);
  const video = usePracticeVideo(studio, playback);
  const [videoOn, setVideoOn] = useState(false);
  const [countingIn, setCountingIn] = useState(true);
  const { player, steps } = playback;

  useEffect(() => {
    player.setCountIn(countingIn ? COUNT_IN_BEATS : NO_COUNT_IN);
  }, [player, countingIn]);

  const stepId = practice.step?.stepId ?? null;
  const following = nextStepOf(steps, stepId);
  const absences = hallAbsencesOf(studio.spots, training);
  const looping = practice.loopKind === 'step';

  const loop = (): void => {
    if (practice.step === null) {
      return;
    }
    practice.loopStep(practice.step.stepId);
    if (!looping && !practice.playing) {
      practice.toggle();
    }
  };

  usePracticeKeys(true, practice, HALL_RATES, loop);

  return {
    playback,
    scene: {
      paths: playback.paths,
      spots: studio.spots,
      stage: playback.stage,
      absentSpotIds: absences.map((absence) => absence.spotId),
      viewpoint: DANCERS_VIEW,
    },
    video,
    stageLabel: hallStageLabelOf(absences, stageSummaryOf(studio.spots, null).open),
    stepName: practice.step === null ? HALL_NO_STEP : practice.stepName,
    stepMeta: trainingStepMetaOf(
      stepId === null ? null : stepNumberOf(steps, stepId),
      steps.length,
      practice.partName,
    ),
    next: hallNextOf(
      following === null
        ? null
        : shownStepNameOf(following.name, stepNumberOf(steps, following.stepId)),
    ),
    absentTitle: hallAbsentTitleOf(training),
    absentNone: hallAbsentNoneOf(training),
    absences: absences.map((absence) => ({
      key: absence.spotId,
      number: absence.number,
      name: absence.name,
    })),
    playing: practice.playing,
    playCaption: practice.playing ? HALL_PAUSE : HALL_PLAY,
    canPlay: practice.canPlay,
    canStep: practice.canPlay && practice.canStep,
    looping,
    slowed: practice.slowed,
    tempoCaption: hallTempoCaptionOf(practice.rate),
    countingIn,
    videoOn,
    hasVideo: studio.videos.length > 0,
    toggle: practice.toggle,
    back: () => {
      practice.skip('back');
    },
    forward: () => {
      practice.skip('forward');
    },
    loop,
    tempo: () => {
      practice.setRate(practice.slowed ? FULL_TEMPO : HALL_TEMPO);
    },
    toggleCountIn: () => {
      setCountingIn((on) => !on);
    },
    toggleVideo: () => {
      setVideoOn((shown) => !shown);
    },
  };
};
