import type { HitTarget } from '@furria/studio/hit-priority';
import type { CountMark, MusicSegment } from '@furria/studio/music-timeline';
import type { AudioPeaks } from '@furria/studio/studio-schemas';
import type { TimelineEdge } from './timeline-edits';
import type { TimelineView } from './timeline-view';
import { secondsOfX, xOfSeconds } from './timeline-view';

export interface WaveBar {
  x: number;
  width: number;
  level: number;
  played: boolean;
}

export type TickKind = 'beat' | 'one';

export interface Tick {
  x: number;
  kind: TickKind;
}

export const BAR_PITCH = 4;
export const BAR_WIDTH = 2.5;
const MIN_TICK_SPACING = 6;
const MIN_SNAP_SPACING = 4;
const COUNTS_PER_EIGHT = 8;
export const BORDER_ZONE_SHARE = 0.42;

export const loudestPeakOf = (peaksByItem: ReadonlyMap<number, AudioPeaks>): number => {
  let top = 0;
  for (const peaks of peaksByItem.values()) {
    for (const peak of peaks.peaks) {
      top = Math.max(top, peak);
    }
  }

  return top;
};

const loudnessOf = (
  segments: readonly MusicSegment[],
  peaksByItem: ReadonlyMap<number, AudioPeaks>,
  from: number,
  to: number,
): number => {
  let loudest = 0;
  for (const segment of segments) {
    const peaks = peaksByItem.get(segment.mediaItemId);
    const start = Math.max(from, segment.timelineStart);
    const end = Math.min(to, segment.timelineEnd);
    if (peaks !== undefined && end > start) {
      const first = Math.floor(
        (segment.sourceStart + start - segment.timelineStart) * peaks.peaksPerSecond,
      );
      const last = Math.max(
        first + 1,
        Math.ceil((segment.sourceStart + end - segment.timelineStart) * peaks.peaksPerSecond),
      );
      for (let index = first; index < last; index += 1) {
        loudest = Math.max(loudest, peaks.peaks[index] ?? 0);
      }
    }
  }

  return loudest;
};

export const waveBarsOf = (
  segments: readonly MusicSegment[],
  peaksByItem: ReadonlyMap<number, AudioPeaks>,
  view: TimelineView,
  width: number,
  playhead: number,
  top: number,
): WaveBar[] => {
  const length = segments.at(-1)?.timelineEnd ?? 0;
  if (top <= 0 || length <= 0) {
    return [];
  }
  const firstX = (((view.offsetPx % BAR_PITCH) + BAR_PITCH) % BAR_PITCH) - BAR_PITCH;
  const bars: WaveBar[] = [];
  for (let x = firstX; x < width; x += BAR_PITCH) {
    const from = secondsOfX(x, view);
    const to = secondsOfX(x + BAR_PITCH, view);
    if (to > 0 && from < length) {
      bars.push({
        x,
        width: BAR_WIDTH,
        level: loudnessOf(segments, peaksByItem, from, to) / top,
        played: to <= playhead,
      });
    }
  }

  return bars;
};

const beatSpacingOf = (marks: readonly CountMark[], view: TimelineView): number => {
  const [first, second] = marks;

  return first === undefined || second === undefined
    ? 0
    : (second.seconds - first.seconds) * view.pxPerSecond;
};

const visibleMarksOf = (
  marks: readonly CountMark[],
  view: TimelineView,
  width: number,
): CountMark[] => {
  const from = secondsOfX(0, view);
  const to = secondsOfX(width, view);

  return marks.filter((mark) => mark.seconds >= from && mark.seconds <= to);
};

export const ticksOf = (marks: readonly CountMark[], view: TimelineView, width: number): Tick[] => {
  const spacing = beatSpacingOf(marks, view);
  const visible = visibleMarksOf(marks, view, width);
  if (spacing >= MIN_TICK_SPACING) {
    return visible.map((mark) => ({
      x: xOfSeconds(mark.seconds, view),
      kind: mark.count === 1 ? 'one' : 'beat',
    }));
  }
  if (spacing * COUNTS_PER_EIGHT >= MIN_TICK_SPACING) {
    return visible
      .filter((mark) => mark.count === 1)
      .map((mark) => ({ x: xOfSeconds(mark.seconds, view), kind: 'one' }));
  }

  return [];
};

export const snapCandidatesOf = (marks: readonly CountMark[], view: TimelineView): number[] => {
  const spacing = beatSpacingOf(marks, view);
  const usable = spacing >= MIN_SNAP_SPACING ? marks : marks.filter((mark) => mark.count === 1);

  return usable.map((mark) => mark.seconds);
};

export const edgeTargetsOf = (
  edges: readonly TimelineEdge[],
  view: TimelineView,
  height: number,
  selectedKey: string | null,
): HitTarget<string>[] =>
  edges.map((edge) => {
    const x = xOfSeconds(edge.seconds, view);
    const border = edge.kind === 'border';
    const zone = height * BORDER_ZONE_SHARE;

    return {
      id: edge.key,
      x: x - 1,
      y: border ? 0 : zone,
      width: 2,
      height: border ? zone : height - zone,
      priority: border ? 1 : 0,
      selected: edge.key === selectedKey,
    };
  });
