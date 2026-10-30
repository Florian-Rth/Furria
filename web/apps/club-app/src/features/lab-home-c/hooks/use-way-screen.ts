import type { KkWayKeysToggleGlyph } from '@furria/ui/KkWayKeys';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { useState } from 'react';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { stepRangeOf } from '@/features/act-player/music-timeline';
import { stepNumberOf } from '@/features/act-player/step-names';
import { isPlayableVideo } from '@/features/act-player/video-sync';
import { usePlayerKeys } from '@/features/act-practice/hooks/use-player-keys';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import { usePractice } from '@/features/act-practice/hooks/use-practice';
import { usePracticeMemory } from '@/features/act-practice/hooks/use-practice-memory';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { usePracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import { practiceStageLabelOf } from '@/features/act-practice/practice-copy';
import type { ViewShare } from '@/features/act-practice/practice-stage';
import { stageSummaryOf } from '@/features/act-practice/practice-stage';
import { useScreenWakeLock } from '@/features/act-training/hooks/use-screen-wake-lock';
import type { Studio } from '@/features/acts/schemas';
import { reachOf } from '../way-camera';
import {
  WAY_LOOP_PART_OFF_LABEL,
  WAY_LOOP_STEP_LABEL,
  WAY_LOOP_STEP_OFF_LABEL,
  WAY_NO_MUSIC_EYEBROW,
  WAY_NOTE_EMPTY,
  WAY_NOTHING_YET,
  wayEyebrowOf,
  wayNoteLabelOf,
} from '../way-copy';
import { wayLoopKeyOf } from '../way-loop';
import type { RibbonGroup } from '../way-ribbon';
import { ribbonOf } from '../way-ribbon';
import type { WayPip } from './use-way-pip';
import { useWayPip } from './use-way-pip';

export const WAY_NOTE_SHEET_ID = 'way-note';

export interface WayLoopControl {
  glyph: KkWayKeysToggleGlyph;
  pressed: boolean;
  label: string;
  press: () => void;
}

export interface WayScreen {
  studio: Studio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
  pip: WayPip;
  hasMusic: boolean;
  hasVideos: boolean;
  eyebrow: string;
  noteText: string;
  noteMuted: boolean;
  noteLabel: string;
  openNote: () => void;
  ribbon: RibbonGroup[];
  ownPath: SpotPath | null;
  reach: ViewShare[];
  stageLabel: string;
  near: boolean;
  canFollow: boolean;
  toggleNear: () => void;
  loop: WayLoopControl;
}

const loopLabels: Record<'off' | 'step' | 'part', string> = {
  off: WAY_LOOP_STEP_LABEL,
  step: WAY_LOOP_STEP_OFF_LABEL,
  part: WAY_LOOP_PART_OFF_LABEL,
};

export const useWayScreen = (actId: number, studio: Studio, viewerId: number | null): WayScreen => {
  const playback = useStudioPlayback(studio, viewerId);
  const practice = usePractice(playback);
  const video = usePracticeVideo(studio, playback);
  const pip = useWayPip();
  const sheets = useKkSheetCommands();
  const [near, setNear] = useState(true);
  usePlayerKeys(practice, true);
  usePracticeMemory({ actId, personId: viewerId }, playback, practice.step?.stepId ?? null);
  useScreenWakeLock();

  const hasMusic = playback.length > 0;
  const ownPath = playback.paths.find((path) => path.spotId === playback.ownSpotId) ?? null;
  const range = practice.step === null ? null : stepRangeOf(practice.step);
  const number = practice.step === null ? 0 : stepNumberOf(playback.steps, practice.step.stepId);
  const description = practice.note;
  const noteText = hasMusic ? (description ?? WAY_NOTE_EMPTY) : WAY_NOTHING_YET;
  const loopKey = wayLoopKeyOf(practice.loopKind);
  const stepId = practice.step?.stepId ?? null;

  return {
    studio,
    playback,
    practice,
    video,
    pip,
    hasMusic,
    hasVideos: studio.videos.some(isPlayableVideo),
    eyebrow: hasMusic
      ? wayEyebrowOf(practice.partName, number, playback.steps.length)
      : WAY_NO_MUSIC_EYEBROW,
    noteText,
    noteMuted: hasMusic && description === null,
    noteLabel: wayNoteLabelOf(noteText),
    openNote: () => {
      sheets.open(WAY_NOTE_SHEET_ID);
    },
    ribbon: ribbonOf(playback.steps, playback.parts, playback.countMarks),
    ownPath,
    reach: ownPath === null ? [] : reachOf(ownPath.keyframes, range, playback.stage),
    stageLabel: practiceStageLabelOf(stageSummaryOf(studio.spots, playback.ownSpotId)),
    near: near && ownPath !== null,
    canFollow: ownPath !== null,
    toggleNear: () => {
      setNear((following) => !following);
    },
    loop: {
      glyph: loopKey.glyph,
      pressed: loopKey.pressed,
      label: loopLabels[practice.loopKind],
      press: () => {
        if (stepId === null) {
          return;
        }
        if (loopKey.press === 'loopPart') {
          practice.loopPart(stepId);
        } else {
          practice.loopStep(stepId);
        }
      },
    },
  };
};
