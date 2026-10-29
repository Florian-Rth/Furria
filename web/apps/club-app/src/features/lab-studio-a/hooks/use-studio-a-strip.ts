import type { KkStudioAStripBandItem, KkStudioAStripMark } from '@furria/ui/KkStudioAStrip';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { waveformOf } from '@/features/act-player/mix-waveform';
import { partLoopLabelOf } from '../studio-a-copy';
import { bandsOf } from '../studio-a-manual';
import type { StudioAPractice } from './use-studio-a-practice';

const WAVE_BUCKETS = 220;

export interface StudioAStripLoop {
  from: number;
  to: number;
}

export interface StudioAStripView {
  wave: number[];
  bands: KkStudioAStripBandItem[];
  marks: KkStudioAStripMark[];
  loop: StudioAStripLoop | null;
}

export const useStudioAStrip = (
  playback: StudioPlayback,
  practice: StudioAPractice,
): StudioAStripView => {
  const { segments, peaksByItem, parts, steps, length, state } = playback;
  const share = (seconds: number): number => (length <= 0 ? 0 : seconds / length);
  const bands = bandsOf(parts, steps, length).map((band): KkStudioAStripBandItem => {
    const part = parts.find((candidate) => candidate.partId === band.partId);
    const looped = band.partId === practice.loopedPartId;

    return {
      key: String(band.partId),
      from: band.from,
      to: band.to,
      label: band.name,
      actionLabel: partLoopLabelOf(band.name),
      state: looped ? 'looped' : band.partId === practice.part?.partId ? 'current' : 'rest',
      onSelect: () => {
        if (part !== undefined) {
          practice.selectPart(part);
        }
      },
    };
  });
  const stepMarks = steps
    .filter((step) => (step.startSeconds ?? 0) > 0)
    .map(
      (step): KkStudioAStripMark => ({
        key: `step-${step.stepId}`,
        at: share(step.startSeconds ?? 0),
        kind: 'step',
      }),
    );
  const cutMarks = segments
    .filter((segment) => segment.timelineStart > 0)
    .map(
      (segment): KkStudioAStripMark => ({
        key: `cut-${segment.mediaItemId}-${segment.timelineStart}`,
        at: share(segment.timelineStart),
        kind: 'cut',
      }),
    );

  return {
    wave: waveformOf(segments, peaksByItem, WAVE_BUCKETS),
    bands,
    marks: [...stepMarks, ...cutMarks],
    loop: state.loop === null ? null : { from: share(state.loop.start), to: share(state.loop.end) },
  };
};
