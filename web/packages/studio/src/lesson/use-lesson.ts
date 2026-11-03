import type { SpotPath } from '@furria/studio/choreography-motion';
import {
  LESSON_LAST,
  LESSON_LOOP_OFF,
  LESSON_LOOP_ON,
  LESSON_NO_DESCRIPTION,
  LESSON_TO_STAGE,
  LESSON_TO_VIDEO,
  lessonCardLabelOf,
  lessonEyebrowOf,
  nextLabelOf,
} from '@furria/studio/lesson-copy';
import type { StepCounts } from '@furria/studio/lesson-counts';
import { stepCountsOf } from '@furria/studio/lesson-counts';
import type { LessonPicturePlan } from '@furria/studio/lesson-picture';
import { lessonPictureOf } from '@furria/studio/lesson-picture';
import type { LessonScreen } from '@furria/studio/lesson-screen';
import type { LessonStripLanes } from '@furria/studio/lesson-strip';
import { lessonStripOf, stripStepIdOf } from '@furria/studio/lesson-strip';
import { stepRangeOf } from '@furria/studio/music-timeline';
import { nextStepOf } from '@furria/studio/next-step';
import { playerKeyActionsOf } from '@furria/studio/practice-key-actions';
import { shownStepNameOf, stepNumberOf } from '@furria/studio/step-names';
import type { PracticeSegmentGroupRow } from '@furria/studio/use-practice-segments';
import { usePracticeSegments } from '@furria/studio/use-practice-segments';
import { useScreenWakeLock } from '@furria/studio/use-screen-wake-lock';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { useState } from 'react';

export interface LessonCard {
  key: string;
  eyebrow: string;
  name: string;
  label: string;
  text: string;
  muted: boolean;
}

export interface LessonNext {
  number: number | null;
  name: string;
  label: string;
  jump: () => void;
}

export interface LessonLoop {
  pressed: boolean;
  label: string;
  toggle: () => void;
}

export interface LessonPicture {
  plan: LessonPicturePlan;
  swapLabel: string;
  swap: () => void;
}

export interface LessonStripView extends LessonStripLanes {
  seek: (seconds: number) => void;
}

export interface LessonReading {
  open: boolean;
  show: () => void;
  close: () => void;
}

export interface Lesson {
  screen: LessonScreen;
  card: LessonCard;
  counts: StepCounts;
  next: LessonNext;
  loop: LessonLoop;
  picture: LessonPicture;
  reading: LessonReading;
  strip: LessonStripView;
  ownPath: SpotPath | null;
  rail: PracticeSegmentGroupRow[];
}

export const useLesson = (screen: LessonScreen): Lesson => {
  const { playback, practice, video } = screen;
  const rail = usePracticeSegments(playback, practice);
  const [swapped, setSwapped] = useState(false);
  const [reading, setReading] = useState(false);
  useScreenWakeLock(true);
  useStudioKeys(playerKeyActionsOf(practice), !reading);

  const { step } = practice;
  const number = step === null ? 0 : stepNumberOf(playback.steps, step.stepId);
  const description = practice.note;
  const plan = lessonPictureOf(video.hero, swapped);
  const following = nextStepOf(playback.steps, step?.stepId ?? null);
  const nextName =
    following === null ? null : shownStepNameOf(following.step.name, following.number);

  return {
    screen,
    card: {
      key: practice.stepKey,
      eyebrow:
        step === null ? '' : lessonEyebrowOf(practice.partName, number, playback.steps.length),
      name: practice.stepName,
      label: lessonCardLabelOf(practice.stepName),
      text: description ?? LESSON_NO_DESCRIPTION,
      muted: description === null,
    },
    counts: stepCountsOf(playback.countMarks, step === null ? null : stepRangeOf(step)),
    next: {
      number: following?.number ?? null,
      name: nextName ?? LESSON_LAST,
      label: nextLabelOf(nextName),
      jump: () => {
        if (following !== null) {
          practice.jumpTo(following.step.stepId);
        }
      },
    },
    loop: {
      pressed: practice.loopKind === 'step',
      label: practice.loopKind === 'step' ? LESSON_LOOP_ON : LESSON_LOOP_OFF,
      toggle: () => {
        if (step !== null) {
          practice.loopStep(step.stepId);
        }
      },
    },
    picture: {
      plan,
      swapLabel: plan.video === 'main' ? LESSON_TO_STAGE : LESSON_TO_VIDEO,
      swap: () => {
        setSwapped((flipped) => !flipped);
      },
    },
    reading: {
      open: reading,
      show: () => {
        setReading(true);
      },
      close: () => {
        setReading(false);
      },
    },
    strip: {
      ...lessonStripOf(playback.steps, playback.parts),
      seek: (seconds) => {
        const target = stripStepIdOf(playback.steps, seconds);
        if (target !== null) {
          practice.jumpTo(target);
        }
      },
    },
    ownPath: playback.paths.find((path) => path.spotId === playback.ownSpotId) ?? null,
    rail,
  };
};
