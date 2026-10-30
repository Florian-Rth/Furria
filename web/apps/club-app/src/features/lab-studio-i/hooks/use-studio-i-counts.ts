import type { KkStudioICountsCell } from '@furria/ui/KkStudioICounts';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import type { Studio } from '@/features/acts/schemas';
import { countRangeText, laneTextOf, STUDIO_I_COUNTS_STILL, tileLabelOf } from '../studio-i-copy';
import { movesOfStep } from '../studio-i-scene';
import type { CountNumbers, StepSpan } from '../studio-i-spans';
import { beatPlaceOf, countNumbersOf } from '../studio-i-spans';
import type { StudioIDrafts } from './use-studio-i-drafts';
import type { StudioIEdit } from './use-studio-i-edit';

export interface CountsLaneView {
  from: number;
  to: number;
  text: string;
  label: string;
  selected: boolean;
  press: () => void;
  dragStart: ((share: number) => void) | undefined;
}

export interface StudioICountsView {
  span: StepSpan | null;
  cells: KkStudioICountsCell[];
  numbers: CountNumbers;
  lane: CountsLaneView | null;
  band: CountsLaneView[];
  empty: string;
}

const shareInSpan = (span: StepSpan, seconds: number): number =>
  (seconds - span.start) / (span.end - span.start);

const unionOf = (windows: readonly TimelineRange[]): TimelineRange | null =>
  windows.length === 0
    ? null
    : {
        start: Math.min(...windows.map((window) => window.start)),
        end: Math.max(...windows.map((window) => window.end)),
      };

export const useStudioICounts = (
  studio: Studio,
  playback: StudioPlayback,
  drafts: StudioIDrafts,
  edit: StudioIEdit,
): StudioICountsView => {
  const { paths, stage, ownSpotId, countMarks } = playback;
  const span = edit.span;

  if (span === null) {
    const length = playback.length;
    return {
      span: null,
      cells: [],
      numbers: 'all',
      lane: null,
      band: drafts.spans.map((step, index) => {
        const name =
          drafts.names.get(step.stepId) ??
          studio.steps.find((candidate) => candidate.stepId === step.stepId)?.name ??
          '';
        return {
          from: length <= 0 ? 0 : step.start / length,
          to: length <= 0 ? 0 : step.end / length,
          text: String(index + 1),
          label: tileLabelOf(index + 1, name),
          selected: false,
          press: () => {
            edit.openPage({ kind: 'step', stepId: step.stepId });
          },
          dragStart: undefined,
        };
      }),
      empty: '',
    };
  }

  const scene = { paths, spots: studio.spots, ownSpotId, stage };
  const moves = movesOfStep(scene, span, drafts.formation);
  const moving = moves.filter((move) => move.window !== null);
  const selectedId = edit.selection?.kind === 'dot' ? edit.selection.spotId : null;
  const selected = moves.find((move) => move.spotId === selectedId) ?? null;
  const window =
    selected === null ? unionOf(moving.flatMap((move) => move.window ?? [])) : selected.window;
  const range =
    window === null
      ? ''
      : countRangeText(
          beatPlaceOf(countMarks, span, window.start, 'start'),
          beatPlaceOf(countMarks, span, window.end, 'end'),
        );
  const number =
    selected === null
      ? null
      : (studio.spots.find((spot) => spot.spotId === selected.spotId)?.number ?? null);
  const first = moving[0];
  const inside = countMarks.filter(
    (mark) => mark.seconds >= span.start - 1e-3 && mark.seconds < span.end - 1e-3,
  );
  const cells = inside.map((mark) => ({
    key: mark.seconds.toFixed(3),
    share: shareInSpan(span, mark.seconds),
    count: mark.count,
  }));
  const dragStart =
    selected === null || selected.window === null
      ? undefined
      : (share: number): void => {
          const end = selected.window?.end ?? span.end;
          const target = span.start + share * (span.end - span.start);
          const candidates = inside.filter((mark) => mark.seconds < end - 1e-3);
          const nearest = candidates.reduce<number | null>(
            (best, mark) =>
              best === null || Math.abs(mark.seconds - target) < Math.abs(best - target)
                ? mark.seconds
                : best,
            null,
          );
          if (nearest !== null) {
            drafts.startMove(span.stepId, selected.spotId, nearest);
          }
        };

  return {
    span,
    cells,
    numbers: countNumbersOf(cells.length, edit.wide),
    lane:
      window === null
        ? null
        : {
            from: shareInSpan(span, window.start),
            to: shareInSpan(span, window.end),
            text: laneTextOf(number, moving.length, range),
            label: laneTextOf(number, moving.length, range),
            selected: selected !== null,
            press: () => {
              if (selected === null && first !== undefined) {
                edit.select({ kind: 'dot', spotId: first.spotId });
              }
            },
            dragStart,
          },
    band: [],
    empty: STUDIO_I_COUNTS_STILL,
  };
};
