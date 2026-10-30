import type { KkLaneTrackTick } from '@furria/ui/KkLaneTrack';
import { waveformOf } from '@/features/act-player/mix-waveform';
import { partRangeOf } from '@/features/act-player/music-timeline';
import { videoNameOf } from '@/features/act-studio/studio-copy';
import type { StageShare } from '@/features/act-studio/studio-edits';
import {
  amountOf,
  clockOf,
  countShapeOf,
  keyLabelOf,
  partBlockLabelOf,
  stepBlockLabelOf,
  videoBlockLabelOf,
} from '../lane-copy';
import { countsBetweenOf, musicTicksOf, rulerTicksOf, shareOf } from '../lane-time';
import type { LaneEditor } from './use-lane-editor';
import type { LaneZoom } from './use-lane-zoom';

const WAVE_PX_PER_BAR = 3;
const MAX_WAVE_BARS = 2400;
const KEY_MERGE_SECONDS = 0.05;

export interface LaneBlock {
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

export interface LaneVideoBlock extends LaneBlock {
  grab: (share: StageShare) => void;
  drag: (share: StageShare) => void;
  drop: () => void;
}

export interface LaneDiamond {
  key: string;
  share: number;
  selected: boolean;
  dimmed: boolean;
  label: string;
  press: () => void;
}

export interface LaneRows {
  ruler: KkLaneTrackTick[];
  beats: KkLaneTrackTick[];
  wave: number[];
  parts: LaneBlock[];
  steps: LaneBlock[];
  videos: LaneVideoBlock[];
  keys: LaneDiamond[];
  keysAside: string | null;
  seek: (share: number) => void;
}

const mergedTimesOf = (times: readonly number[]): number[] =>
  [...times]
    .sort((left, right) => left - right)
    .filter(
      (time, index, sorted) => index === 0 || time - (sorted[index - 1] ?? 0) > KEY_MERGE_SECONDS,
    );

export const useLaneRows = (lane: LaneEditor, zoom: LaneZoom): LaneRows => {
  const { screen, editor, takes, focus, partId, keySeconds } = lane;
  const { playback, practice, studio } = screen;
  const { length, steps, parts, countMarks, paths } = playback;
  const currentId = practice.step?.stepId ?? null;
  const share = (seconds: number | null): number => shareOf(seconds ?? 0, length);
  const bars = Math.min(MAX_WAVE_BARS, Math.max(2, Math.round(zoom.width / WAVE_PX_PER_BAR)));
  const chosen = paths.filter((path) => editor.selected.includes(path.spotId));
  const shownPaths = chosen.length > 0 ? chosen : paths;
  const keyTimes = mergedTimesOf(
    shownPaths.flatMap((path) => path.keyframes.map((keyframe) => keyframe.seconds)),
  );
  const spotsAt = (seconds: number): number =>
    shownPaths.filter((path) =>
      path.keyframes.some((keyframe) => Math.abs(keyframe.seconds - seconds) <= KEY_MERGE_SECONDS),
    ).length;
  const numberOf = (stepId: number): number =>
    steps.findIndex((step) => step.stepId === stepId) + 1;

  return {
    ruler: rulerTicksOf(length, zoom.labelPerSecond),
    beats: musicTicksOf(countMarks, length, zoom.labelPerSecond),
    wave: waveformOf(playback.segments, playback.peaksByItem, bars),
    parts: parts.flatMap((part) => {
      const range = partRangeOf(part, steps);
      const first = numberOf(part.stepIds[0] ?? -1);
      const last = numberOf(part.stepIds.at(-1) ?? -1);
      if (range === null) {
        return [];
      }
      return [
        {
          key: String(part.partId),
          start: share(range.start),
          end: share(range.end),
          lead: null,
          title: part.name,
          meta: amountOf(part.stepIds.length, 'Schritt', 'Schritte'),
          selected: focus === 'part' && partId === part.partId,
          current: currentId !== null && part.stepIds.includes(currentId),
          label: partBlockLabelOf(part.name, first, last),
          press: () => {
            lane.focusPart(part.partId);
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
          lane.focusStep(step.stepId);
        },
      };
    }),
    videos: takes.bars.map((bar) => {
      const video = studio.videos.find((candidate) => String(candidate.videoId) === bar.key);
      const number = video === undefined ? 0 : studio.videos.indexOf(video) + 1;
      const name = videoNameOf(video?.name ?? null, number);

      return {
        key: bar.key,
        start: bar.start,
        end: bar.end,
        lead: null,
        title: name,
        meta:
          video?.durationSeconds === null || video === undefined
            ? null
            : clockOf(video.durationSeconds),
        selected: focus === 'video' && bar.selected,
        current: false,
        label: videoBlockLabelOf(name),
        press: () => {
          lane.focusVideo(Number(bar.key));
        },
        grab: (point: StageShare) => {
          lane.focusVideo(Number(bar.key));
          bar.press(point);
        },
        drag: bar.move,
        drop: bar.finish,
      };
    }),
    keys: keyTimes.map((seconds) => ({
      key: String(seconds),
      share: share(seconds),
      selected:
        focus === 'key' &&
        keySeconds !== null &&
        Math.abs(keySeconds - seconds) <= KEY_MERGE_SECONDS,
      dimmed: chosen.length === 0,
      label: keyLabelOf(seconds, spotsAt(seconds)),
      press: () => {
        lane.focusKey(seconds);
      },
    })),
    keysAside: chosen.length === 0 ? null : amountOf(chosen.length, 'Platz', 'Plätze'),
    seek: (point) => {
      playback.player.seek(point * length);
    },
  };
};
