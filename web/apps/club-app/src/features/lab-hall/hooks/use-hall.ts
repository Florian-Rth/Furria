import type { KkHallAbsentPerson } from '@furria/ui/KkHall';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { COUNT_IN_BEATS } from '@/features/act-player/count-in';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import { shownStepNameOf, stepNumberOf } from '@/features/act-player/step-names';
import { usePractice } from '@/features/act-practice/hooks/use-practice';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { usePracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { useScreenWakeLock } from '@/features/act-training/hooks/use-screen-wake-lock';
import { trainingStepMetaOf } from '@/features/act-training/training-copy';
import { actPagePathOf } from '@/features/acts/acts-origin';
import type { Studio, StudioTraining } from '@/features/acts/schemas';
import {
  HALL_NO_STEP,
  HALL_PAUSE,
  HALL_PLAY,
  hallAbsentNoneOf,
  hallAbsentTitleOf,
  hallNextOf,
  hallTempoCaptionOf,
} from '../hall-copy';
import type { HallScene } from '../hall-scene';
import { hallAbsencesOf, nextStepOf } from '../hall-scene';

const FULL_TEMPO = 1;
const HALL_TEMPO = 0.75;
const NO_VIEWER = null;

export interface Hall {
  playback: StudioPlayback;
  scene: HallScene;
  video: PracticeVideo;
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
  videoOn: boolean;
  hasVideo: boolean;
  toggle: () => void;
  back: () => void;
  forward: () => void;
  loop: () => void;
  tempo: () => void;
  toggleVideo: () => void;
  close: () => void;
}

export const useHall = (
  studio: Studio,
  actId: number,
  training: StudioTraining | null,
  viewpoint: StageViewpoint,
): Hall => {
  useScreenWakeLock();
  const navigate = useNavigate();
  const playback = useStudioPlayback(studio, NO_VIEWER);
  const practice = usePractice(playback);
  const video = usePracticeVideo(studio, playback);
  const [videoOn, setVideoOn] = useState(false);
  const { player, steps } = playback;

  useEffect(() => {
    player.setCountIn(COUNT_IN_BEATS);
  }, [player]);

  const stepId = practice.step?.stepId ?? null;
  const following = nextStepOf(steps, stepId);
  const absences = hallAbsencesOf(studio.spots, training);
  const looping = practice.loopKind === 'step';

  return {
    playback,
    scene: {
      paths: playback.paths,
      spots: studio.spots,
      stage: playback.stage,
      absentSpotIds: absences.map((absence) => absence.spotId),
      viewpoint,
    },
    video,
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
    videoOn,
    hasVideo: studio.videos.length > 0,
    toggle: practice.toggle,
    back: () => {
      practice.skip('back');
    },
    forward: () => {
      practice.skip('forward');
    },
    loop: () => {
      if (practice.step === null) {
        return;
      }
      practice.loopStep(practice.step.stepId);
      if (!looping && !practice.playing) {
        practice.toggle();
      }
    },
    tempo: () => {
      practice.setRate(practice.slowed ? FULL_TEMPO : HALL_TEMPO);
    },
    toggleVideo: () => {
      setVideoOn((shown) => !shown);
    },
    close: () => {
      void navigate({ to: actPagePathOf(actId) });
    },
  };
};
