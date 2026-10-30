import { useState } from 'react';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { CountMark } from '@/features/act-player/music-timeline';
import { stepRangeOf } from '@/features/act-player/music-timeline';
import { shownStepNameOf, stepNumberOf } from '@/features/act-player/step-names';
import { usePlayerKeys } from '@/features/act-practice/hooks/use-player-keys';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import { usePractice } from '@/features/act-practice/hooks/use-practice';
import { usePracticeMemory } from '@/features/act-practice/hooks/use-practice-memory';
import type { PracticeSegmentGroupRow } from '@/features/act-practice/hooks/use-practice-segments';
import { usePracticeSegments } from '@/features/act-practice/hooks/use-practice-segments';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { usePracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { useScreenWakeLock } from '@/features/act-training/hooks/use-screen-wake-lock';
import type { Studio } from '@/features/acts/schemas';
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
} from '../lesson-copy';
import { countGroupsOf, stepMarksOf } from '../lesson-counts';
import { nextStepOf } from '../lesson-next';
import type { LessonPicturePlan } from '../lesson-picture';
import { lessonPictureOf } from '../lesson-picture';

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

export interface LessonCounts {
  marks: CountMark[];
  groups: number[][];
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

export interface LessonReading {
  open: boolean;
  show: () => void;
  close: () => void;
}

export interface Lesson {
  studio: Studio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  card: LessonCard;
  counts: LessonCounts;
  next: LessonNext;
  loop: LessonLoop;
  picture: LessonPicture;
  reading: LessonReading;
  ownPath: SpotPath | null;
  rail: PracticeSegmentGroupRow[];
}

export const useLesson = (actId: number, studio: Studio, viewerId: number | null): Lesson => {
  const playback = useStudioPlayback(studio, viewerId);
  const practice = usePractice(playback);
  const video = usePracticeVideo(studio, playback);
  const rail = usePracticeSegments(playback, practice);
  const [swapped, setSwapped] = useState(false);
  const [reading, setReading] = useState(false);
  usePracticeMemory({ actId, personId: viewerId }, playback, practice.step?.stepId ?? null);
  useScreenWakeLock();
  usePlayerKeys(practice, !reading);

  const { step } = practice;
  const number = step === null ? 0 : stepNumberOf(playback.steps, step.stepId);
  const marks = stepMarksOf(playback.countMarks, step === null ? null : stepRangeOf(step));
  const description = practice.note;
  const plan = lessonPictureOf(video.hero, swapped);
  const following = nextStepOf(playback.steps, step?.stepId ?? null);
  const nextName =
    following === null ? null : shownStepNameOf(following.step.name, following.number);

  return {
    studio,
    playback,
    practice,
    video,
    card: {
      key: practice.stepKey,
      eyebrow:
        step === null ? '' : lessonEyebrowOf(practice.partName, number, playback.steps.length),
      name: practice.stepName,
      label: lessonCardLabelOf(practice.stepName),
      text: description ?? LESSON_NO_DESCRIPTION,
      muted: description === null,
    },
    counts: { marks, groups: countGroupsOf(marks) },
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
    ownPath: playback.paths.find((path) => path.spotId === playback.ownSpotId) ?? null,
    rail,
  };
};
