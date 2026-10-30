import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import { partOfStep } from '@/features/act-player/music-timeline';
import type { Studio } from '@/features/acts/schemas';
import {
  clipCoverTextOf,
  clipRoleTextOf,
  countRangeText,
  lengthText,
  markTitleOf,
  metresText,
  movesTextOf,
  neighbourTextOf,
  offsetText,
  placeLabelOf,
  rangeText,
  STUDIO_I_BENT,
  STUDIO_I_BORDER,
  STUDIO_I_CLOSE,
  STUDIO_I_COUNT,
  STUDIO_I_COVERS,
  STUDIO_I_DETAIL,
  STUDIO_I_EARLIER,
  STUDIO_I_FREE,
  STUDIO_I_FROM,
  STUDIO_I_LATER,
  STUDIO_I_LENGTH,
  STUDIO_I_MOVES,
  STUDIO_I_NEIGHBOUR,
  STUDIO_I_NO_PART,
  STUDIO_I_OFFSET,
  STUDIO_I_PART,
  STUDIO_I_PLACE,
  STUDIO_I_ROLE,
  STUDIO_I_RUNS,
  STUDIO_I_STEP_SUMMARY,
  STUDIO_I_STILL,
  STUDIO_I_STRAIGHT,
  STUDIO_I_TIME,
  STUDIO_I_VIDEO,
  STUDIO_I_VIDEO_NONE,
  STUDIO_I_WAY,
  spotTitleOf,
  timeText,
} from '../studio-i-copy';
import { loopOnSpan } from '../studio-i-playhead';
import { movesOfStep } from '../studio-i-scene';
import type { StepEdge, StepSpan } from '../studio-i-spans';
import { beatPlaceOf, countsIn, movedBorderOf } from '../studio-i-spans';
import { nudgedShiftOf } from '../studio-i-video';
import type { StudioIClipView } from './use-studio-i-clip';
import type { StudioIDrafts } from './use-studio-i-drafts';
import type { StudioIEdit } from './use-studio-i-edit';

const FRAME_SECONDS = 0.04;
const LINE_JOIN = ' · ';

export type DetailKind = 'summary' | 'dot' | 'mark' | 'video';

export interface DetailFactView {
  key: string;
  label: string;
  value: string;
  tone: 'plain' | 'changed';
}

export interface DetailNudgeView {
  label: string;
  value: string;
  earlierLabel: string;
  laterLabel: string;
  earlier: () => void;
  later: () => void;
}

export interface DetailResetView {
  disabled: boolean;
  press: () => void;
}

export interface StudioIDetailView {
  kind: DetailKind;
  label: string;
  open: boolean;
  eyebrow: string;
  title: string;
  facts: DetailFactView[];
  line: string;
  nudge: DetailNudgeView | null;
  reset: DetailResetView | null;
  slot: boolean;
  closeLabel: string;
  close: (() => void) | null;
}

const fact = (label: string, value: string, changed = false): DetailFactView => ({
  key: label,
  label,
  value,
  tone: changed ? 'changed' : 'plain',
});

const CLOSED: StudioIDetailView = {
  kind: 'summary',
  label: STUDIO_I_DETAIL,
  open: false,
  eyebrow: '',
  title: '',
  facts: [],
  line: '',
  nudge: null,
  reset: null,
  slot: false,
  closeLabel: STUDIO_I_CLOSE,
  close: null,
};

const stepNameOf = (
  studio: Studio,
  drafts: StudioIDrafts,
  span: StepSpan | undefined,
): string | null =>
  span === undefined
    ? null
    : (drafts.names.get(span.stepId) ??
      studio.steps.find((step) => step.stepId === span.stepId)?.name ??
      null);

const unionOf = (windows: readonly TimelineRange[]): TimelineRange | null =>
  windows.length === 0
    ? null
    : {
        start: Math.min(...windows.map((window) => window.start)),
        end: Math.max(...windows.map((window) => window.end)),
      };

export const useStudioIDetail = (
  studio: Studio,
  playback: StudioPlayback,
  drafts: StudioIDrafts,
  edit: StudioIEdit,
  clip: StudioIClipView,
): StudioIDetailView => {
  const { paths, stage, ownSpotId, countMarks, player, parts } = playback;
  const span = edit.span;
  const selection = edit.selection;

  if (span === null) {
    return CLOSED;
  }

  const scene = { paths, spots: studio.spots, ownSpotId, stage };
  const moves = movesOfStep(scene, span, drafts.formation);
  const index = drafts.spans.indexOf(span);
  const name = stepNameOf(studio, drafts, span) ?? '';
  const rangeOf = (window: TimelineRange): string =>
    countRangeText(
      beatPlaceOf(countMarks, span, window.start, 'start'),
      beatPlaceOf(countMarks, span, window.end, 'end'),
    );
  const open = { ...CLOSED, open: true, close: edit.clearSelection };

  if (selection?.kind === 'dot') {
    const move = moves.find((candidate) => candidate.spotId === selection.spotId);
    const spot = studio.spots.find((candidate) => candidate.spotId === selection.spotId);
    const window = move?.window ?? null;
    const person =
      spot === undefined || spot.person === null
        ? STUDIO_I_FREE
        : `${spot.person.firstName} ${spot.person.lastName}`;
    const place = move === undefined ? '–' : metresText(move.to);
    const moving = window === null ? STUDIO_I_STILL : rangeOf(window);
    const drafted = move?.drafted === true;

    return {
      ...open,
      kind: 'dot',
      eyebrow: spotTitleOf(spot?.number ?? 0),
      title: person,
      facts: [
        fact(STUDIO_I_PLACE, place, drafted),
        fact(STUDIO_I_FROM, move === undefined ? '–' : metresText(move.from)),
        fact(
          STUDIO_I_MOVES,
          window === null ? moving : `${moving} · ${rangeText(window.start, window.end)}`,
          drafted,
        ),
        fact(
          STUDIO_I_WAY,
          window === null
            ? STUDIO_I_STILL
            : move?.bent === true
              ? STUDIO_I_BENT
              : STUDIO_I_STRAIGHT,
        ),
      ],
      line: [place, moving].join(LINE_JOIN),
      reset: {
        disabled: !drafted,
        press: () => {
          drafts.resetSpot(span.stepId, selection.spotId);
        },
      },
      slot: true,
    };
  }

  if (selection?.kind === 'mark') {
    const edge: StepEdge = selection.edge;
    const seconds = edge === 'start' ? span.start : span.end;
    const original = drafts.original.find((candidate) => candidate.stepId === span.stepId);
    const originalSeconds =
      original === undefined ? seconds : edge === 'start' ? original.start : original.end;
    const changed = Math.abs(originalSeconds - seconds) > 1e-3;
    const neighbour = neighbourTextOf(
      edge,
      stepNameOf(studio, drafts, drafts.spans[edge === 'start' ? index - 1 : index + 1]),
    );
    const length = lengthText(countsIn(countMarks, span), span.end - span.start);
    const place = placeLabelOf(beatPlaceOf(countMarks, span, seconds, edge));

    return {
      ...open,
      kind: 'mark',
      eyebrow: STUDIO_I_BORDER,
      title: `${markTitleOf(edge, name)} · ${timeText(seconds)}`,
      facts: [
        fact(STUDIO_I_TIME, timeText(seconds), changed),
        fact(STUDIO_I_COUNT, place),
        fact(STUDIO_I_NEIGHBOUR, neighbour),
        fact(STUDIO_I_LENGTH, length, changed),
      ],
      line: [neighbour, length].join(LINE_JOIN),
      reset: {
        disabled: !changed,
        press: () => {
          const next = movedBorderOf(drafts.spans, span.stepId, edge, originalSeconds, countMarks);
          drafts.setSpans(next);
          const moved = next.find((candidate) => candidate.stepId === span.stepId);
          if (moved !== undefined) {
            loopOnSpan(player, moved, countMarks);
          }
        },
      },
    };
  }

  if (selection?.kind === 'video' && clip.clip !== null) {
    const videoId = clip.clip.video.videoId;
    const start = (clip.clip.video.startSeconds ?? 0) + clip.shift;
    const runs = rangeText(start, start + (clip.clip.video.durationSeconds ?? 0));
    const role = clipRoleTextOf(clip.clip.role, clip.partName);
    const shiftBy = (direction: -1 | 1): void => {
      drafts.shift(videoId, nudgedShiftOf(clip.shift, direction, FRAME_SECONDS));
    };

    return {
      ...open,
      kind: 'video',
      eyebrow: STUDIO_I_VIDEO,
      title: clip.name,
      facts: [
        fact(STUDIO_I_ROLE, role),
        fact(STUDIO_I_RUNS, runs, clip.shift !== 0),
        fact(STUDIO_I_COVERS, clipCoverTextOf(clip.clip.cover)),
      ],
      line: [role, runs].join(LINE_JOIN),
      nudge: {
        label: STUDIO_I_OFFSET,
        value: offsetText(clip.shift),
        earlierLabel: STUDIO_I_EARLIER,
        laterLabel: STUDIO_I_LATER,
        earlier: () => {
          shiftBy(-1);
        },
        later: () => {
          shiftBy(1);
        },
      },
      reset: {
        disabled: clip.shift === 0,
        press: () => {
          drafts.shift(videoId, 0);
        },
      },
    };
  }

  const moving = moves.filter((move) => move.window !== null);
  const union = unionOf(moving.flatMap((move) => move.window ?? []));
  const part = partOfStep(parts, span.stepId);

  return {
    ...CLOSED,
    eyebrow: STUDIO_I_STEP_SUMMARY,
    title: name,
    facts: [
      fact(STUDIO_I_PART, part?.name ?? STUDIO_I_NO_PART),
      fact(STUDIO_I_TIME, rangeText(span.start, span.end)),
      fact(STUDIO_I_LENGTH, lengthText(countsIn(countMarks, span), span.end - span.start)),
      fact(
        STUDIO_I_MOVES,
        movesTextOf(moving.length, moves.length, union === null ? '' : rangeOf(union)),
      ),
      fact(STUDIO_I_VIDEO, clip.clip === null ? STUDIO_I_VIDEO_NONE : clip.name),
    ],
  };
};
