import { createArea } from '@/features/hall-plan/hall-ops';
import { distanceBetween } from '@/features/hall-plan/plan-geometry';
import { formatDistance } from '@/features/hall-plan/plan-measure';
import type { Guide } from '@/features/hall-plan/plan-snap';
import type { AreaElement, AreaKind, HallDocument, Point } from '@/features/hall-plan/schemas';
import type { HallTool } from './hall-builder-tools';
import type { SelectionFrame, VertexHandle } from './hall-builder-view';
import { selectionFrameOf, vertexHandlesOf } from './hall-builder-view';
import type { HallDraft, PolylineTool } from './hall-gesture';

const GHOST_ID = 'ghost';

export interface OverlayLine {
  key: string;
  from: Point;
  to: Point;
  label: string;
}

export interface OverlayPolyline {
  tool: PolylineTool;
  points: Point[];
}

export interface HallOverlay {
  frame: SelectionFrame | null;
  vertices: VertexHandle[];
  guides: OverlayLine[];
  marquee: { from: Point; to: Point } | null;
  polyline: OverlayPolyline | null;
  door: { from: Point; to: Point } | null;
  area: AreaElement | null;
  measure: OverlayLine | null;
}

const FRAMELESS_DRAFTS: ReadonlySet<HallDraft['kind']> = new Set(['marquee', 'pan']);

const guideLineOf = (guide: Guide, index: number): OverlayLine =>
  guide.axis === 'x'
    ? {
        key: `g${index}`,
        from: { x: guide.at, y: guide.from },
        to: { x: guide.at, y: guide.to },
        label: '',
      }
    : {
        key: `g${index}`,
        from: { x: guide.from, y: guide.at },
        to: { x: guide.to, y: guide.at },
        label: '',
      };

const measureLineOf = (from: Point, to: Point): OverlayLine | null =>
  distanceBetween(from, to) < 1
    ? null
    : { key: 'measure', from, to, label: formatDistance(distanceBetween(from, to)) };

const segmentOf = (draft: HallDraft): OverlayLine | null => {
  switch (draft.kind) {
    case 'polyline': {
      const last = draft.points.at(-1);

      return last === undefined ? null : measureLineOf(last, draft.cursor);
    }
    case 'drag':
    case 'measure':
      return measureLineOf(draft.from, draft.to);
    default:
      return null;
  }
};

export const overlayOf = (
  document: HallDocument,
  selection: readonly string[],
  draft: HallDraft,
  tool: HallTool,
  areaKind: AreaKind,
): HallOverlay => {
  const showsFrame = tool === 'select' && !FRAMELESS_DRAFTS.has(draft.kind);
  const frame = showsFrame ? selectionFrameOf(document, selection) : null;

  return {
    frame,
    vertices: frame === null ? [] : vertexHandlesOf(document, selection),
    guides: draft.kind === 'move' ? draft.guides.map(guideLineOf) : [],
    marquee: draft.kind === 'marquee' ? { from: draft.from, to: draft.to } : null,
    polyline:
      draft.kind === 'polyline'
        ? { tool: draft.tool, points: [...draft.points, draft.cursor] }
        : null,
    door:
      draft.kind === 'drag' && draft.tool === 'door' ? { from: draft.from, to: draft.to } : null,
    area:
      draft.kind === 'drag' && draft.tool === 'area'
        ? createArea(GHOST_ID, areaKind, draft.from, draft.to)
        : null,
    measure: segmentOf(draft),
  };
};
