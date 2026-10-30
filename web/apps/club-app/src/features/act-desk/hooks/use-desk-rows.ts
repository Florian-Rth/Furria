import { waveformOf } from '@/features/act-player/mix-waveform';
import { partRangeOf } from '@/features/act-player/music-timeline';
import { videoNameOf } from '@/features/act-studio/studio-copy';
import type { StageShare } from '@/features/act-studio/studio-edits';
import {
  clockOf,
  countShapeOf,
  keyLabelOf,
  partBlockLabelOf,
  spotsAmountOf,
  stepBlockLabelOf,
  stepsAmountOf,
  videoBlockLabelOf,
} from '../desk-copy';
import { KEY_MATCH_SECONDS, keyedSpotsAt, keyTimesOf } from '../desk-keyframes';
import type { DeskTick } from '../desk-time';
import { countsBetweenOf, musicTicksOf, rulerTicksOf, shareOf } from '../desk-time';
import type { ActDesk } from './use-act-desk';
import { useDeskKeyDrag } from './use-desk-key-drag';
import type { DeskZoom } from './use-desk-zoom';

const WAVE_PX_PER_BAR = 3;
const MAX_WAVE_BARS = 2400;

export interface DeskBlock {
  key: string;
  start: number;
  end: number;
  lead: string | null;
  title: string;
  meta: string | null;
  selected: boolean;
  current: boolean;
  label: string;
  press: () => void;
}

export interface DeskVideoBlock extends DeskBlock {
  grab: (share: StageShare) => void;
  drag: (share: StageShare) => void;
  drop: () => void;
}

export interface DeskDiamond {
  key: string;
  share: number;
  selected: boolean;
  dimmed: boolean;
  label: string;
  press: () => void;
  grab: () => void;
  drag: (share: StageShare) => void;
  drop: () => void;
  nudge: (direction: -1 | 1) => void;
}

export interface DeskRows {
  ruler: DeskTick[];
  beats: DeskTick[];
  wave: number[];
  parts: DeskBlock[];
  steps: DeskBlock[];
  videos: DeskVideoBlock[];
  keys: DeskDiamond[];
  keysAside: string | null;
  seek: (share: number) => void;
}

const isNear = (left: number | null, right: number): boolean =>
  left !== null && Math.abs(left - right) <= KEY_MATCH_SECONDS;

export const useDeskRows = (desk: ActDesk, zoom: DeskZoom): DeskRows => {
  const { screen, editor, takes, focus, partId, keySeconds } = desk;
  const { playback, practice, studio } = screen;
  const { length, steps, parts, countMarks, paths } = playback;
  const currentId = practice.step?.stepId ?? null;
  const share = (seconds: number | null): number => shareOf(seconds ?? 0, length);
  const bars = Math.min(MAX_WAVE_BARS, Math.max(2, Math.round(zoom.width / WAVE_PX_PER_BAR)));
  const chosen = paths.filter((path) => editor.selected.includes(path.spotId));
  const shownPaths = chosen.length > 0 ? chosen : paths;
  const keyDrag = useDeskKeyDrag(desk, shownPaths);
  const numberOf = (stepId: number): number =>
    steps.findIndex((step) => step.stepId === stepId) + 1;

  return {
    ruler: rulerTicksOf(length, zoom.labelPerSecond),
    beats: musicTicksOf(countMarks, length, zoom.labelPerSecond),
    wave: waveformOf(playback.segments, playback.peaksByItem, bars),
    parts: parts.flatMap((part) => {
      const range = partRangeOf(part, steps);
      if (range === null) {
        return [];
      }
      const first = numberOf(part.stepIds[0] ?? -1);
      const last = numberOf(part.stepIds.at(-1) ?? -1);

      return [
        {
          key: String(part.partId),
          start: share(range.start),
          end: share(range.end),
          lead: null,
          title: part.name,
          meta: stepsAmountOf(part.stepIds.length),
          selected: focus === 'part' && partId === part.partId,
          current: currentId !== null && part.stepIds.includes(currentId),
          label: partBlockLabelOf(part.name, first, last),
          press: () => {
            desk.focusPart(part.partId);
          },
        },
      ];
    }),
    steps: steps.map((step, index) => {
      const current = step.stepId === currentId;
      const counts = countsBetweenOf(countMarks, step.startSeconds ?? 0, step.endSeconds ?? 0);

      return {
        key: String(step.stepId),
        start: share(step.startSeconds),
        end: share(step.endSeconds),
        lead: String(index + 1),
        title: step.name,
        meta: counts > 0 ? countShapeOf(counts) : null,
        selected: focus === 'step' && current,
        current,
        label: stepBlockLabelOf(index + 1, step.name, current),
        press: () => {
          desk.focusStep(step.stepId);
        },
      };
    }),
    videos: takes.bars.map((bar) => {
      const video = studio.videos.find((candidate) => String(candidate.videoId) === bar.key);
      const number = video === undefined ? 0 : studio.videos.indexOf(video) + 1;
      const name = videoNameOf(video?.name ?? null, number);
      const duration = video?.durationSeconds ?? null;

      return {
        key: bar.key,
        start: bar.start,
        end: bar.end,
        lead: null,
        title: name,
        meta: duration === null ? null : clockOf(duration),
        selected: focus === 'video' && bar.selected,
        current: false,
        label: videoBlockLabelOf(name),
        press: () => {
          bar.press({ x: bar.start, y: 0 });
          bar.finish();
          desk.focusVideo();
        },
        grab: (point: StageShare) => {
          desk.focusVideo();
          bar.press(point);
        },
        drag: bar.move,
        drop: bar.finish,
      };
    }),
    keys: keyTimesOf(shownPaths).map((seconds, index) => ({
      key: String(index),
      share: share(seconds),
      selected: focus === 'key' && isNear(keyDrag.heldAt ?? keySeconds, seconds),
      dimmed: chosen.length === 0,
      label: keyLabelOf(seconds, keyedSpotsAt(shownPaths, seconds)),
      press: () => {
        desk.focusKey(seconds);
      },
      grab: () => {
        keyDrag.grab(seconds);
      },
      drag: (point: StageShare) => {
        keyDrag.move(point.x);
      },
      drop: keyDrag.drop,
      nudge: (direction: -1 | 1) => {
        keyDrag.nudge(seconds, direction);
      },
    })),
    keysAside: chosen.length === 0 ? null : spotsAmountOf(chosen.length),
    seek: (point) => {
      playback.player.seek(point * length);
    },
  };
};
