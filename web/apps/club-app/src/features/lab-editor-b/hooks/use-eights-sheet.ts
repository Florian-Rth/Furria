import type {
  KkEightsSheetCountTone,
  KkEightsSheetEdgeHandle,
  KkEightsSheetGrip,
  KkEightsSheetKey,
} from '@furria/ui/KkEightsSheet';
import { useRef, useState } from 'react';
import { waveformOf } from '@/features/act-player/mix-waveform';
import { partRangeOf } from '@/features/act-player/music-timeline';
import { videoNameOf } from '@/features/act-studio/studio-copy';
import { borderMovedOf } from '@/features/act-studio/studio-edits';
import { partSettingsOf, regroupedPartsOf } from '@/features/act-studio/studio-steps';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import type { SheetDensity, SheetRow } from '../count-sheet';
import {
  cellWaveOf,
  countsPerRowOf,
  countTargetOf,
  eightsOfMarks,
  keyedCellsOf,
  movingCountIn,
  nearestMarkIndexOf,
  sheetRowsOf,
} from '../count-sheet';
import {
  countLabelOf,
  edgeLabelOf,
  edgeValueOf,
  gripLabelOf,
  moreStepsOf,
  rowLabelOf,
  stepLeadOf,
  waysTextOf,
} from '../eights-copy';
import { partFirstStepAt } from '../sheet-moves';
import type { EightsStudio } from './use-eights-studio';

const SLOTS: Record<SheetDensity, number> = { half: 10, eight: 6, two: 4, all: 2 };
const MAX_BUCKETS = 6000;
const EDGE_TOLERANCE = 0.02;

export interface EightsLane {
  lead: string | null;
  text: string | null;
  continues: boolean;
  current: boolean;
}

export interface EightsPartLane {
  name: string | null;
  continues: boolean;
  current: boolean;
  grip: KkEightsSheetGrip | null;
}

export interface EightsCellView {
  key: string;
  column: number;
  count: number;
  seconds: number;
  label: string;
  numbered: boolean;
  wave: number[];
  tone: KkEightsSheetCountTone;
  keyed: KkEightsSheetKey;
  partEdge: boolean;
  edge: KkEightsSheetEdgeHandle | null;
}

export interface EightsRowView {
  key: string;
  index: number;
  seconds: number;
  label: string;
  partStart: boolean;
  part: EightsPartLane;
  step: EightsLane;
  video: EightsLane;
  ways: EightsLane;
  cells: EightsCellView[];
}

export interface EightsSheet {
  rows: EightsRowView[];
  spans: SheetRow[];
  columns: number;
  seek: (seconds: number) => void;
}

interface Dragged {
  beforeId: number;
  afterId: number;
  start: number;
}

interface PartDraft {
  partId: number;
  stepId: number;
}

const overlaps = (start: number, end: number, row: SheetRow): boolean =>
  start < row.end - EDGE_TOLERANCE && end > row.start + EDGE_TOLERANCE;

const stepIndexAt = (steps: readonly StudioStep[], seconds: number): number =>
  steps.findLastIndex((step) => (step.startSeconds ?? 0) <= seconds + EDGE_TOLERANCE);

export const useEightsSheet = (studio: EightsStudio): EightsSheet => {
  const { screen, editor, density } = studio;
  const { playback, practice, edits, manual, evening, mode } = screen;
  const { countMarks, length, steps, parts, paths, segments, peaksByItem, player } = playback;
  const [dragged, setDragged] = useState<Dragged | null>(null);
  const [partDraft, setPartDraft] = useState<PartDraft | null>(null);
  const moved = useRef<Dragged | null>(null);
  const partMoved = useRef<PartDraft | null>(null);
  const editable = mode.editing && evening === null;
  const spans = sheetRowsOf(countMarks, length, density);
  const columns = countsPerRowOf(density);
  const eights = eightsOfMarks(countMarks);
  const slots = SLOTS[density];
  const bars = waveformOf(
    segments,
    peaksByItem,
    Math.min(MAX_BUCKETS, Math.max(1, countMarks.length * slots)),
  );
  const currentId = practice.step?.stepId ?? null;
  const shownParts: readonly StudioPart[] =
    partDraft === null
      ? parts
      : regroupedPartsOf(steps, parts, new Map([[partDraft.partId, partDraft.stepId]]));
  const placedParts = shownParts.filter((part) => !part.adrift && part.stepIds.length > 0);
  const currentPartId =
    placedParts.find((part) => currentId !== null && part.stepIds.includes(currentId))?.partId ??
    null;
  const stepRange = steps.find((step) => step.stepId === currentId);
  const selected = new Set(editor.selected);
  const keyPaths = selected.size === 0 ? paths : paths.filter((path) => selected.has(path.spotId));
  const keyed = keyedCellsOf(
    countMarks,
    keyPaths.flatMap((path) => path.keyframes.map((keyframe) => keyframe.seconds)),
  );
  const tracks = paths.map((path) =>
    path.keyframes.map((keyframe) => ({
      seconds: keyframe.seconds,
      right: keyframe.position.rightMetres,
      back: keyframe.position.backMetres,
    })),
  );
  const edgeAt = new Map<number, number>();
  steps.forEach((step, index) => {
    if (index > 0 && step.startSeconds !== null) {
      edgeAt.set(nearestMarkIndexOf(countMarks, step.startSeconds), index);
    }
  });
  const partEdges = new Set(
    placedParts.slice(1).flatMap((part) => {
      const first = steps.find((step) => step.stepId === part.stepIds[0]);
      return first?.startSeconds === null || first === undefined
        ? []
        : [nearestMarkIndexOf(countMarks, first.startSeconds)];
    }),
  );
  const videos = screen.studio.videos.filter(
    (video) =>
      video.placement === 'onTimeline' &&
      video.startSeconds !== null &&
      video.durationSeconds !== null,
  );

  const moveBorder = (before: StudioStep, after: StudioStep, seconds: number): void => {
    const bounds = borderMovedOf(steps, before.stepId, seconds, countMarks);
    const start = bounds[after.stepId]?.start;
    if (start === undefined || moved.current?.start === start) {
      return;
    }
    const next = { beforeId: before.stepId, afterId: after.stepId, start };
    moved.current = next;
    setDragged(next);
    edits.setBounds(bounds);
  };

  const commitBorder = (): void => {
    const done = moved.current;
    moved.current = null;
    setDragged(null);
    if (done === null) {
      return;
    }
    const clear = (): void => {
      edits.clearBounds([done.beforeId, done.afterId]);
    };
    void manual.move
      .mutateAsync({ stepId: done.afterId, atSeconds: done.start })
      .then(clear, clear);
  };

  const nudgeBorder = (before: StudioStep, after: StudioStep, direction: -1 | 1): void => {
    const from = after.startSeconds;
    const target = from === null ? null : countTargetOf(countMarks, from, direction);
    if (target === null) {
      return;
    }
    const start = borderMovedOf(steps, before.stepId, target, countMarks)[after.stepId]?.start;
    if (start !== undefined && start !== from) {
      manual.move.mutate({ stepId: after.stepId, atSeconds: start });
    }
  };

  const settlePart = (part: StudioPart, firstStepId: number): void => {
    if (part.stepIds[0] === firstStepId) {
      return;
    }
    manual.settlePart.mutate({
      partId: part.partId,
      settings: { ...partSettingsOf(part), firstStepId },
    });
  };

  const gripOf = (part: StudioPart, index: number): KkEightsSheetGrip | null => {
    const original = parts.find((candidate) => candidate.partId === part.partId);
    if (!editable || index === 0 || original === undefined) {
      return null;
    }
    return {
      label: gripLabelOf(part.name),
      active: partDraft?.partId === part.partId,
      onMove: (seconds) => {
        const stepId = partFirstStepAt(steps, parts, part.partId, seconds);
        if (stepId !== null && stepId !== partMoved.current?.stepId) {
          const draft = { partId: part.partId, stepId };
          partMoved.current = draft;
          setPartDraft(draft);
        }
      },
      onEnd: () => {
        const draft = partMoved.current;
        partMoved.current = null;
        setPartDraft(null);
        if (draft !== null) {
          settlePart(original, draft.stepId);
        }
      },
      onNudge: (direction) => {
        const order = steps.map((step) => step.stepId);
        const at = order.indexOf(original.stepIds[0] ?? -1) + direction;
        const step = steps[at];
        const target =
          step === undefined
            ? null
            : partFirstStepAt(steps, parts, part.partId, step.startSeconds ?? 0);
        if (target !== null) {
          settlePart(original, target);
        }
      },
    };
  };

  const edgeOf = (markIndex: number): KkEightsSheetEdgeHandle | null => {
    const stepIndex = edgeAt.get(markIndex);
    const before = stepIndex === undefined ? undefined : steps[stepIndex - 1];
    const after = stepIndex === undefined ? undefined : steps[stepIndex];
    const mark = countMarks[markIndex];
    if (!editable || stepIndex === undefined || before === undefined || after === undefined) {
      return null;
    }
    return {
      label: edgeLabelOf(stepIndex + 1, after.name),
      value: edgeValueOf(after.startSeconds ?? 0, (eights[markIndex] ?? 0) + 1, mark?.count ?? 1),
      active: dragged?.afterId === after.stepId,
      onMove: (seconds) => {
        moveBorder(before, after, seconds);
      },
      onEnd: commitBorder,
      onNudge: (direction) => {
        nudgeBorder(before, after, direction);
      },
    };
  };

  const toneOf = (seconds: number): KkEightsSheetCountTone => {
    const index = stepIndexAt(steps, seconds);
    if (index >= 0 && steps[index]?.stepId === currentId) {
      return 'current';
    }
    return index % 2 === 1 ? 'shaded' : 'plain';
  };

  const keyOf = (index: number): KkEightsSheetKey => {
    if (!keyed.has(index)) {
      return 'none';
    }
    return selected.size > 0 ? 'selected' : 'other';
  };

  const stepLaneOf = (row: SheetRow): EightsLane => {
    const starting = steps.filter(
      (step) =>
        step.startSeconds !== null &&
        step.startSeconds >= row.start - EDGE_TOLERANCE &&
        step.startSeconds < row.end - EDGE_TOLERANCE,
    );
    const first = starting[0];
    const current =
      stepRange !== undefined &&
      overlaps(stepRange.startSeconds ?? 0, stepRange.endSeconds ?? 0, row);
    return {
      lead: first === undefined ? null : stepLeadOf(steps.indexOf(first) + 1),
      text: first === undefined ? null : moreStepsOf(first.name, starting.length - 1),
      continues:
        first === undefined &&
        steps.some((step) => overlaps(step.startSeconds ?? 0, step.endSeconds ?? 0, row)),
      current,
    };
  };

  const partLaneOf = (row: SheetRow): EightsPartLane => {
    const ranges = placedParts.map((part, index) => ({
      part,
      index,
      range: partRangeOf(part, steps),
    }));
    const starting = ranges.find(
      ({ range }) =>
        range !== null &&
        range.start >= row.start - EDGE_TOLERANCE &&
        range.start < row.end - EDGE_TOLERANCE,
    );
    const covering = ranges.find(
      ({ range }) => range !== null && overlaps(range.start, range.end, row),
    );
    return {
      name: starting?.part.name ?? null,
      continues: starting === undefined && covering !== undefined,
      current: covering?.part.partId === currentPartId && currentPartId !== null,
      grip: starting === undefined ? null : gripOf(starting.part, starting.index),
    };
  };

  const videoLaneOf = (row: SheetRow): EightsLane => {
    const starting = videos.find(
      (video) => (video.startSeconds ?? 0) >= row.start && (video.startSeconds ?? 0) < row.end,
    );
    const covering = videos.some((video) =>
      overlaps(
        video.startSeconds ?? 0,
        (video.startSeconds ?? 0) + (video.durationSeconds ?? 0),
        row,
      ),
    );
    return {
      lead: null,
      text:
        starting === undefined ? null : videoNameOf(starting.name, videos.indexOf(starting) + 1),
      continues: starting === undefined && covering,
      current: false,
    };
  };

  return {
    spans,
    columns,
    seek: (seconds) => {
      player.seek(seconds);
    },
    rows: spans.map((row) => {
      const firstCell = row.cells[0];
      const eight = firstCell === undefined ? null : firstCell.eight + 1;
      const part = partLaneOf(row);
      return {
        key: `${density}-${row.index}`,
        index: row.index,
        seconds: row.start,
        label: rowLabelOf(eight, row.start),
        partStart: part.name !== null,
        part,
        step: stepLaneOf(row),
        video: videoLaneOf(row),
        ways: {
          lead: waysTextOf(movingCountIn(tracks, row)),
          text: null,
          continues: false,
          current: false,
        },
        cells: row.cells.map((cell) => ({
          key: String(cell.index),
          column: cell.column,
          count: cell.count,
          seconds: cell.start,
          label: countLabelOf(cell.eight + 1, cell.count, cell.start),
          numbered: density !== 'all' || cell.count === 1,
          wave: cellWaveOf(bars, length, cell, slots),
          tone: toneOf(cell.start),
          keyed: keyOf(cell.index),
          partEdge: partEdges.has(cell.index),
          edge: edgeOf(cell.index),
        })),
      };
    }),
  };
};
