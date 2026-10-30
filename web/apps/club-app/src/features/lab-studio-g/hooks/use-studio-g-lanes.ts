import type {
  KkStudioGDrag,
  KkStudioGRulerLabel,
  KkStudioGRulerTick,
  KkStudioGTick,
  KkStudioGTickBar,
} from '@furria/ui/KkStudioGTimeline';
import { useRef, useState } from 'react';
import { waveformOf } from '@/features/act-player/mix-waveform';
import {
  markLabelOf,
  partLabelOf,
  rulerTextOf,
  songLabelOf,
  stepLabelOf,
  tickLabelOf,
  videoLabelOf,
  videoTitleOf,
} from '../studio-g-copy';
import type { StudioGDesk } from '../studio-g-desk';
import { clampedBorderOf, clampedVideoStartOf } from '../studio-g-edits';
import type { PartBlock, SongBlock, StepBlock, VideoBlock } from '../studio-g-lanes';
import {
  keyframeTicksOf,
  moveBarsOf,
  partBlocksOf,
  songBlocksOf,
  stepBlocksOf,
  videoBlocksOf,
} from '../studio-g-lanes';
import { selectedSpotIdsOf } from '../studio-g-selection';
import { draggedSecondsOf, rulerOf, snappedToCountOf } from '../studio-g-timeline';

const WAVE_BUCKETS_PER_SECOND = 14;
const MAX_WAVE_BUCKETS = 4000;
const SNAP_PX = 12;
const SAME_MOMENT_SECONDS = 0.01;

interface LaneItem {
  key: number;
  label: string;
  selected: boolean;
  select: () => void;
}

export interface SongLaneItem extends SongBlock, LaneItem {}
export interface PartLaneItem extends PartBlock, LaneItem {}
export interface StepLaneItem extends StepBlock, LaneItem {}
export interface VideoLaneItem extends VideoBlock, LaneItem {
  text: string;
  drag: KkStudioGDrag | null;
}

export interface StepMarkModel {
  seconds: number;
  label: string;
  dragging: boolean;
  drag: KkStudioGDrag;
}

export interface StudioGLanes {
  length: number;
  rulerTicks: KkStudioGRulerTick[];
  rulerLabels: KkStudioGRulerLabel[];
  wave: number[];
  cuts: number[];
  songs: SongLaneItem[];
  parts: PartLaneItem[];
  steps: StepLaneItem[];
  mark: StepMarkModel | null;
  videos: VideoLaneItem[];
  ticks: KkStudioGTick[];
  bars: KkStudioGTickBar[];
  selectTick: (seconds: number) => void;
}

export const useStudioGLanes = (desk: StudioGDesk, pixelsPerSecond: number): StudioGLanes => {
  const { playback, studio, edits, picked } = desk;
  const { selection, select } = picked;
  const { segments, length, countMarks, peaksByItem, paths, player } = playback;
  const dragFrom = useRef(0);
  const [dragging, setDragging] = useState(false);
  const ruler = rulerOf(countMarks, pixelsPerSecond);
  const buckets = Math.min(MAX_WAVE_BUCKETS, Math.round(length * WAVE_BUCKETS_PER_SECOND));
  const stepBlocks = stepBlocksOf(playback.steps, playback.parts);
  const focus = selectedSpotIdsOf(selection);
  const tickBlocks = keyframeTicksOf(paths, focus);

  const selectedStep =
    selection.kind === 'step'
      ? (stepBlocks.find((step) => step.stepId === selection.stepId) ?? null)
      : null;

  const dragBorder =
    (stepId: number, start: number): KkStudioGDrag =>
    (phase, deltaPx) => {
      if (phase === 'start') {
        dragFrom.current = start;
        setDragging(true);
        return;
      }
      const wanted = snappedToCountOf(
        draggedSecondsOf(dragFrom.current, deltaPx, pixelsPerSecond),
        countMarks,
        SNAP_PX / pixelsPerSecond,
      );
      const border = clampedBorderOf(playback.steps, stepId, wanted);
      if (border !== null) {
        edits.setBorder(stepId, border);
      }
      if (phase === 'end') {
        setDragging(false);
      }
    };

  const dragVideo =
    (videoId: number, start: number): KkStudioGDrag =>
    (phase, deltaPx) => {
      if (phase === 'start') {
        dragFrom.current = start;
        return;
      }
      edits.setVideoStart(
        videoId,
        clampedVideoStartOf(draggedSecondsOf(dragFrom.current, deltaPx, pixelsPerSecond), length),
      );
    };

  return {
    length,
    rulerTicks: ruler.ticks,
    rulerLabels: ruler.labels.map((label) => ({
      seconds: label.seconds,
      text: rulerTextOf(label.eight),
    })),
    wave: waveformOf(segments, peaksByItem, buckets),
    cuts: segments.slice(1).map((segment) => segment.timelineStart),
    songs: songBlocksOf(segments, studio.songs).map((song) => ({
      ...song,
      key: song.mediaItemId,
      label: songLabelOf(song.number, song.name),
      selected: selection.kind === 'song' && selection.mediaItemId === song.mediaItemId,
      select: () => {
        select({ kind: 'song', mediaItemId: song.mediaItemId });
      },
    })),
    parts: partBlocksOf(playback.parts, playback.steps).map((part) => ({
      ...part,
      key: part.partId,
      label: partLabelOf(part.name),
      selected: selection.kind === 'part' && selection.partId === part.partId,
      select: () => {
        select({ kind: 'part', partId: part.partId });
      },
    })),
    steps: stepBlocks.map((step) => ({
      ...step,
      key: step.stepId,
      label: stepLabelOf(step.number, step.name),
      selected: selectedStep?.stepId === step.stepId,
      select: () => {
        select({ kind: 'step', stepId: step.stepId });
      },
    })),
    mark:
      selectedStep === null || !selectedStep.movable
        ? null
        : {
            seconds: selectedStep.start,
            label: markLabelOf(selectedStep.name),
            dragging,
            drag: dragBorder(selectedStep.stepId, selectedStep.start),
          },
    videos: videoBlocksOf(studio.videos, playback.parts).map((video) => {
      const selected = selection.kind === 'video' && selection.videoId === video.videoId;

      return {
        ...video,
        key: video.videoId,
        label: videoLabelOf(video.name),
        text: videoTitleOf(video.name),
        selected,
        select: () => {
          select({ kind: 'video', videoId: video.videoId });
        },
        drag: selected ? dragVideo(video.videoId, video.start) : null,
      };
    }),
    ticks: tickBlocks.map((tick) => ({
      seconds: tick.seconds,
      label: tickLabelOf(tick.seconds, tick.spotIds.length),
      selected:
        selection.kind === 'keyframe' &&
        Math.abs(selection.seconds - tick.seconds) < SAME_MOMENT_SECONDS,
    })),
    bars: moveBarsOf(paths, focus),
    selectTick: (seconds) => {
      const tick = tickBlocks.find(
        (candidate) => Math.abs(candidate.seconds - seconds) < SAME_MOMENT_SECONDS,
      );
      if (tick !== undefined) {
        select({ kind: 'keyframe', seconds: tick.seconds, spotIds: focus.length > 0 ? focus : [] });
        player.seek(tick.seconds);
      }
    },
  };
};
