import type { KkFocusLanesBeat } from '@furria/ui/KkFocusLanes';
import { waveformOf } from '@/features/act-player/mix-waveform';
import { partRangeOf } from '@/features/act-player/music-timeline';
import { shownStepNameOf } from '@/features/act-player/step-names';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import type {
  ActStudioTakes,
  ActStudioVideoBar,
} from '@/features/act-studio/hooks/use-act-studio-takes';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { videoNameOf } from '@/features/act-studio/studio-copy';
import {
  FOCUS_NONE,
  FOCUS_PICK_SPOT,
  keyLabelOf,
  laneMusicMetaOf,
  stepLabelOf,
} from '../focus-copy';
import type { FocusWindow } from '../focus-window';
import { showsEveryCount } from '../focus-window';
import type { FocusBorder } from './use-focus-borders';
import { useFocusBorders } from './use-focus-borders';

const BARS_PER_SECOND = 8;
const MAX_BARS = 2400;
const OVERVIEW_BARS = 320;
const KEY_TOLERANCE = 0.02;

export interface FocusLanePart {
  key: string;
  start: number;
  end: number;
  name: string;
  shade: boolean;
  current: boolean;
}

export interface FocusLaneStep {
  key: string;
  start: number;
  end: number;
  number: number;
  name: string;
  label: string;
  current: boolean;
  press: () => void;
}

export interface FocusLaneKey {
  key: string;
  share: number;
  label: string;
  moving: boolean;
  press: () => void;
}

export interface FocusLaneSpan extends ActStudioVideoBar {
  text: string;
}

export interface FocusLanes {
  parts: FocusLanePart[];
  steps: FocusLaneStep[];
  borders: FocusBorder[];
  bars: number[];
  overviewBars: number[];
  beats: KkFocusLanesBeat[];
  spans: FocusLaneSpan[];
  keys: FocusLaneKey[];
  stepsMeta: string;
  musicMeta: string;
  videoMeta: string;
  pathsMeta: string;
}

export const useFocusLanes = (
  screen: StudioScreen,
  stage: ActStudioStage,
  takes: ActStudioTakes,
  view: FocusWindow,
  reveal: () => void,
): FocusLanes => {
  const { playback, practice, studio } = screen;
  const { steps, parts, length, countMarks, segments, peaksByItem, paths, player } = playback;
  const borders = useFocusBorders(screen);
  const shareOf = (seconds: number | null): number =>
    length <= 0 || seconds === null ? 0 : seconds / length;
  const currentStepId = practice.step?.stepId ?? null;
  const everyCount = showsEveryCount(view);
  const spotId = stage.selected[0] ?? null;
  const spot = studio.spots.find((candidate) => candidate.spotId === spotId) ?? null;
  const spotName = spot === null ? null : (spot.person?.firstName ?? `Platz ${spot.number}`);
  const keyframes = paths.find((path) => path.spotId === spotId)?.keyframes ?? [];
  const stepStarts = steps.map((step) => step.startSeconds ?? 0);

  return {
    parts: parts.flatMap((part, index) => {
      const range = partRangeOf(part, steps);
      return range === null
        ? []
        : [
            {
              key: String(part.partId),
              start: shareOf(range.start),
              end: shareOf(range.end),
              name: part.name,
              shade: index % 2 === 1,
              current: currentStepId !== null && part.stepIds.includes(currentStepId),
            },
          ];
    }),
    steps: steps.map((step, index) => ({
      key: String(step.stepId),
      start: shareOf(step.startSeconds),
      end: shareOf(step.endSeconds),
      number: index + 1,
      name: shownStepNameOf(step.name, index + 1),
      label: stepLabelOf(index + 1, step.name),
      current: step.stepId === currentStepId,
      press: () => {
        practice.jumpTo(step.stepId);
        reveal();
      },
    })),
    borders,
    bars: waveformOf(
      segments,
      peaksByItem,
      Math.min(MAX_BARS, Math.round(length * BARS_PER_SECOND)),
    ),
    overviewBars: waveformOf(segments, peaksByItem, OVERVIEW_BARS),
    beats: countMarks.map((mark, index) => ({
      key: String(index),
      share: shareOf(mark.seconds),
      strong: mark.count === 1,
      text: everyCount || mark.count === 1 ? String(mark.count) : null,
    })),
    spans: takes.bars.map((bar) => {
      const index = studio.videos.findIndex((video) => String(video.videoId) === bar.key);
      return { ...bar, text: videoNameOf(studio.videos[index]?.name ?? null, index + 1) };
    }),
    keys: keyframes.map((keyframe, index) => ({
      key: String(index),
      share: shareOf(keyframe.seconds),
      label: keyLabelOf(keyframe.seconds, spotName ?? ''),
      moving: !stepStarts.some((start) => Math.abs(start - keyframe.seconds) < KEY_TOLERANCE),
      press: () => {
        player.seek(keyframe.seconds);
        reveal();
      },
    })),
    stepsMeta: steps.length === 0 ? FOCUS_NONE : String(steps.length),
    musicMeta: laneMusicMetaOf(length),
    videoMeta: takes.bars.length === 0 ? FOCUS_NONE : String(takes.bars.length),
    pathsMeta: spotName ?? FOCUS_PICK_SPOT,
  };
};
