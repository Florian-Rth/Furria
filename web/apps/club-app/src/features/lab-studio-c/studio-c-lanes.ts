import type {
  KkStudioCCut,
  KkStudioCMark,
  KkStudioCSpan,
  KkStudioCTick,
} from '@furria/ui/studio-c-types';
import { waveformOf } from '@/features/act-player/mix-waveform';
import type { Studio } from '@/features/acts/schemas';
import type { StudioCDesk } from './hooks/use-studio-c-desk';
import {
  eightSecondsOf,
  keyframeMarksOf,
  motionSpansOf,
  pixelsPerSecondOf,
  songCutsOf,
  spansOnTrack,
  ticksOf,
  videoSpansOnTrack,
} from './studio-c-timeline';

const WAVE_PIXELS_PER_BAR = 4;

export interface StudioCLanes {
  pixelsPerSecond: number;
  trackWidth: number;
  ticks: KkStudioCTick[];
  wave: number[];
  cuts: KkStudioCCut[];
  videoSpans: KkStudioCSpan[];
  ownSpans: KkStudioCSpan[];
  formationMarks: KkStudioCMark[];
  ownMarks: KkStudioCMark[];
}

export const studioCLanesOf = (
  desk: StudioCDesk,
  studio: Studio,
  viewportWidth: number,
): StudioCLanes => {
  const { playback, ownPath, videoSpans } = desk;
  const pixelsPerSecond = pixelsPerSecondOf(viewportWidth, eightSecondsOf(playback.countMarks));
  const trackWidth = playback.length * pixelsPerSecond;
  const bars = Math.round(trackWidth / WAVE_PIXELS_PER_BAR);

  return {
    pixelsPerSecond,
    trackWidth,
    ticks: ticksOf(playback.countMarks, pixelsPerSecond),
    wave: waveformOf(playback.segments, playback.peaksByItem, bars),
    cuts: songCutsOf(playback.segments, studio.songs, pixelsPerSecond),
    videoSpans: videoSpansOnTrack(videoSpans, pixelsPerSecond),
    ownSpans: spansOnTrack(motionSpansOf(ownPath, playback.length), pixelsPerSecond),
    formationMarks: keyframeMarksOf(playback.paths, pixelsPerSecond),
    ownMarks: keyframeMarksOf(ownPath === null ? [] : [ownPath], pixelsPerSecond),
  };
};
