import type { KkStudioIWaveBandPiece, KkStudioIWaveTick } from '@furria/ui/KkStudioIWave';
import { useState } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { waveformOf } from '@/features/act-player/mix-waveform';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import type { Studio } from '@/features/acts/schemas';
import {
  edgeTextOf,
  markLabelOf,
  STUDIO_I_WAVE_LABEL,
  STUDIO_I_WHOLE_LABEL,
  timeText,
} from '../studio-i-copy';
import { loopOnSpan } from '../studio-i-playhead';
import { songNameOf, songsInOrder } from '../studio-i-songs';
import type { CountNumbers, StepEdge, StepSpan } from '../studio-i-spans';
import { countNumbersOf, isMovableEdge, movedBorderOf } from '../studio-i-spans';
import {
  pageWindowOf,
  seamsIn,
  secondsAtShare,
  shareIn,
  ticksIn,
  windowBarsOf,
} from '../studio-i-wave';
import type { StudioIDrafts } from './use-studio-i-drafts';
import type { StudioIEdit } from './use-studio-i-edit';

const PAGE_BARS = 140;
const WHOLE_BARS = 180;

export interface WaveSeamView {
  key: string;
  share: number;
  label: string;
}

export interface WaveMarkView {
  edge: StepEdge;
  share: number;
  text: string;
  label: string;
  selected: boolean;
  movable: boolean;
  press: () => void;
  drag: (share: number) => void;
}

export interface StudioIWaveView {
  label: string;
  window: TimelineRange;
  bars: number[];
  from: number;
  to: number;
  ticks: KkStudioIWaveTick[];
  numbers: CountNumbers;
  seams: WaveSeamView[];
  marks: WaveMarkView[];
  band: KkStudioIWaveBandPiece[];
  before: string;
  after: string;
}

interface LockedWindow {
  stepId: number;
  window: TimelineRange;
}

const nameOf = (
  studio: Studio,
  drafts: StudioIDrafts,
  stepId: number | undefined,
): string | null =>
  stepId === undefined
    ? null
    : (drafts.names.get(stepId) ??
      studio.steps.find((step) => step.stepId === stepId)?.name ??
      null);

const seamViewsOf = (
  studio: Studio,
  playback: StudioPlayback,
  window: TimelineRange,
): WaveSeamView[] => {
  const songs = songsInOrder(studio);

  return seamsIn(playback.segments, window).map((seam) => {
    const song = songs.find((candidate) => String(candidate.mediaItemId) === seam.key);
    return { ...seam, label: song === undefined ? '' : songNameOf(song) };
  });
};

const partBandOf = (
  playback: StudioPlayback,
  spans: readonly StepSpan[],
  length: number,
): KkStudioIWaveBandPiece[] =>
  playback.parts.flatMap((part) => {
    const own = spans.filter((span) => part.stepIds.includes(span.stepId));
    const first = own[0];
    const last = own.at(-1);

    return first === undefined || last === undefined || length <= 0
      ? []
      : [
          {
            key: String(part.partId),
            from: first.start / length,
            to: last.end / length,
            label: part.name,
          },
        ];
  });

export const useStudioIWave = (
  studio: Studio,
  playback: StudioPlayback,
  drafts: StudioIDrafts,
  edit: StudioIEdit,
): StudioIWaveView => {
  const { player, countMarks, segments, peaksByItem, length } = playback;
  const span = edit.span;
  const [locked, setLocked] = useState<LockedWindow | null>(null);

  if (span !== null && locked?.stepId !== span.stepId) {
    setLocked({ stepId: span.stepId, window: pageWindowOf(span, length) });
  }

  if (span === null) {
    const whole = { start: 0, end: length };
    return {
      label: STUDIO_I_WHOLE_LABEL,
      window: whole,
      bars: waveformOf(segments, peaksByItem, WHOLE_BARS),
      from: 0,
      to: 1,
      ticks: [],
      numbers: 'all',
      seams: seamViewsOf(studio, playback, whole),
      marks: [],
      band: partBandOf(playback, drafts.spans, length),
      before: '',
      after: '',
    };
  }

  const window =
    locked !== null && locked.stepId === span.stepId ? locked.window : pageWindowOf(span, length);
  const index = drafts.spans.indexOf(span);
  const ticks = ticksIn(countMarks, window, span);
  const markOf = (edge: StepEdge): WaveMarkView => {
    const seconds = edge === 'start' ? span.start : span.end;
    const text = timeText(seconds);
    return {
      edge,
      share: shareIn(window, seconds),
      text,
      label: markLabelOf(edge, text),
      selected: edit.selection?.kind === 'mark' && edit.selection.edge === edge,
      movable: isMovableEdge(drafts.spans, span.stepId, edge),
      press: () => {
        edit.select({ kind: 'mark', edge });
      },
      drag: (share) => {
        const next = movedBorderOf(
          drafts.spans,
          span.stepId,
          edge,
          secondsAtShare(window, share),
          countMarks,
        );
        drafts.setSpans(next);
        const moved = next.find((candidate) => candidate.stepId === span.stepId);
        if (moved !== undefined) {
          loopOnSpan(player, moved, countMarks);
        }
      },
    };
  };

  return {
    label: STUDIO_I_WAVE_LABEL,
    window,
    bars: windowBarsOf(segments, peaksByItem, window, PAGE_BARS),
    from: shareIn(window, span.start),
    to: shareIn(window, span.end),
    ticks,
    numbers: countNumbersOf(ticks.filter((tick) => tick.inside).length, edit.wide),
    seams: seamViewsOf(studio, playback, window),
    marks: [markOf('start'), markOf('end')],
    band: [],
    before: edgeTextOf('start', nameOf(studio, drafts, drafts.spans[index - 1]?.stepId)),
    after: edgeTextOf('end', nameOf(studio, drafts, drafts.spans[index + 1]?.stepId)),
  };
};
