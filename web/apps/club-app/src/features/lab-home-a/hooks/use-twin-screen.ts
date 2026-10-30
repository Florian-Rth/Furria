import { useState } from 'react';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import { stepRangeOf } from '@/features/act-player/music-timeline';
import { usePlayerKeys } from '@/features/act-practice/hooks/use-player-keys';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import { usePractice } from '@/features/act-practice/hooks/use-practice';
import type { PracticeGestures } from '@/features/act-practice/hooks/use-practice-gestures';
import { usePracticeGestures } from '@/features/act-practice/hooks/use-practice-gestures';
import { usePracticeMemory } from '@/features/act-practice/hooks/use-practice-memory';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { usePracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { useScreenWakeLock } from '@/features/act-training/hooks/use-screen-wake-lock';
import type { Studio } from '@/features/acts/schemas';
import { loopLabelOf, loopTextOf, TWIN_NO_NOTE } from '../twin-copy';
import { eightsInRangeOf, loopMoveOf } from '../twin-practice';

export interface TwinLoop {
  text: string;
  label: string;
  cycle: () => void;
}

export interface TwinNote {
  text: string;
  reading: boolean;
  open: (() => void) | null;
  close: () => void;
}

export interface TwinScreen {
  studio: Studio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  gestures: PracticeGestures;
  ownPath: SpotPath | null;
  ownNumber: number | null;
  stageRatio: number;
  stepRange: TimelineRange | null;
  stepEights: number;
  loop: TwinLoop;
  note: TwinNote;
}

export const useTwinScreen = (
  actId: number,
  studio: Studio,
  viewerId: number | null,
): TwinScreen => {
  const playback = useStudioPlayback(studio, viewerId);
  const practice = usePractice(playback);
  const video = usePracticeVideo(studio, playback);
  const gestures = usePracticeGestures(practice);
  const [reading, setReading] = useState(false);
  usePracticeMemory({ actId, personId: viewerId }, playback, practice.step?.stepId ?? null);
  usePlayerKeys(practice, !reading);
  useScreenWakeLock();

  const { step } = practice;
  const stepRange = step === null ? null : stepRangeOf(step);
  const description = step?.description ?? null;
  const ownNumber = studio.spots.find((spot) => spot.spotId === playback.ownSpotId)?.number ?? null;

  return {
    studio,
    playback,
    practice,
    video,
    gestures,
    ownPath: playback.paths.find((path) => path.spotId === playback.ownSpotId) ?? null,
    ownNumber,
    stageRatio: playback.stage.widthMetres / playback.stage.depthMetres,
    stepRange,
    stepEights: eightsInRangeOf(playback.countMarks, stepRange),
    loop: {
      text: loopTextOf(practice.loopKind),
      label: loopLabelOf(practice.loopKind),
      cycle: () => {
        if (step === null) {
          return;
        }
        const move = loopMoveOf(practice.loopKind);
        if (move === 'step') {
          practice.loopStep(step.stepId);
        } else if (move === 'part') {
          practice.loopPart(step.stepId);
        } else {
          playback.controls.clearLoop();
        }
      },
    },
    note: {
      text: practice.note ?? TWIN_NO_NOTE,
      reading,
      open:
        description === null
          ? null
          : () => {
              setReading(true);
            },
      close: () => {
        setReading(false);
      },
    },
  };
};
