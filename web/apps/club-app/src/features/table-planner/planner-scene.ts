import type {
  ClearanceFinding,
  FindingKind,
  FindingSeverity,
} from '@/features/hall-plan/plan-clearance';
import type { Bounds } from '@/features/hall-plan/plan-geometry';
import { boundsCenter, boundsOfShape, unionBounds } from '@/features/hall-plan/plan-geometry';
import type {
  ChairSide,
  Point,
  SeatingStandard,
  TablePlanDocument,
  TableShape,
  TableType,
} from '@/features/hall-plan/schemas';
import type { RowLayout } from '@/features/hall-plan/table-layout';
import { rowSpanOf } from '@/features/hall-plan/table-layout';
import type { PlannerSelection } from './planner-selection';
import { isChairSelected, selectedRowIdsOf } from './planner-selection';
import type { PlannerView } from './planner-tools';

const CHAIR_WIDTH_CM = 44;
const CHAIR_GAP_CM = 6;
const CHAIR_DEPTH_SHARE = 0.85;

export interface SceneTable {
  key: string;
  rowId: string;
  shape: TableShape;
  x: number;
  y: number;
  lengthCm: number;
  widthCm: number;
  rotation: number;
  segments: number;
  number: string | null;
  selected: boolean;
  conflict: boolean;
}

export interface SceneCell {
  key: string;
  id: string;
  x: number;
  y: number;
  rotation: number;
  widthCm: number;
  depthCm: number;
  conflict: boolean;
  faded: boolean;
}

export interface SceneChair {
  key: string;
  id: string;
  x: number;
  y: number;
  rotation: number;
  widthCm: number;
  depthCm: number;
  number: string | null;
  hasNote: boolean;
  removed: boolean;
  faded: boolean;
  conflict: boolean;
  selected: boolean;
}

export interface SceneNote {
  key: string;
  at: Point;
}

export interface SceneFinding {
  key: string;
  severity: FindingSeverity;
  kind: FindingKind;
  from: Point;
  to: Point;
  distanceCm: number;
  selected: boolean;
}

export interface SceneFrame {
  x: number;
  y: number;
  widthCm: number;
  heightCm: number;
  rotation: number;
}

export interface PlannerScene {
  tables: SceneTable[];
  cells: SceneCell[];
  chairs: SceneChair[];
  notes: SceneNote[];
  findings: SceneFinding[];
  frame: SceneFrame | null;
}

export interface SceneInput {
  document: TablePlanDocument;
  layouts: readonly RowLayout[];
  types: ReadonlyMap<number, TableType>;
  standard: SeatingStandard;
  findings: readonly ClearanceFinding[];
  selection: PlannerSelection;
  view: PlannerView;
  focusedFinding: string | null;
}

const CHAIR_ID_PREFIX = 'chair';
const CHAIR_ID_SEPARATOR = ':';

export const chairIdOf = (rowId: string, side: ChairSide, index: number): string =>
  [CHAIR_ID_PREFIX, rowId, side, String(index)].join(CHAIR_ID_SEPARATOR);

const conflictChairsOf = (findings: readonly ClearanceFinding[]): Set<string> =>
  new Set(
    findings
      .filter((finding) => finding.severity === 'conflict')
      .flatMap((finding) =>
        finding.chairs.map((chair) => chairIdOf(chair.rowId, chair.side, chair.index)),
      ),
  );

const conflictRowsOf = (findings: readonly ClearanceFinding[]): Set<string> =>
  new Set(
    findings
      .filter((finding) => finding.severity === 'conflict' && finding.chairs.length === 0)
      .flatMap((finding) => finding.rowIds),
  );

const tablesOf = (
  layout: RowLayout,
  type: TableType,
  number: string | null,
  selected: boolean,
  conflict: boolean,
): SceneTable[] => {
  if (layout.shape === 'round') {
    return layout.tables.map((table) => ({
      key: `${layout.rowId}:${table.index}`,
      rowId: layout.rowId,
      shape: 'round',
      x: table.center.x,
      y: table.center.y,
      lengthCm: type.lengthCm,
      widthCm: type.lengthCm,
      rotation: layout.rotation,
      segments: 1,
      number: table.index === 0 ? number : null,
      selected,
      conflict,
    }));
  }

  return [
    {
      key: layout.rowId,
      rowId: layout.rowId,
      shape: 'rectangle',
      x: layout.center.x,
      y: layout.center.y,
      lengthCm: type.lengthCm * layout.tableCount,
      widthCm: type.widthCm,
      rotation: layout.rotation,
      segments: layout.tableCount,
      number,
      selected,
      conflict,
    },
  ];
};

const cellsOf = (
  layout: RowLayout,
  standard: SeatingStandard,
  conflictChairs: ReadonlySet<string>,
): SceneCell[] =>
  layout.chairs
    .filter((chair) => chair.state !== 'removed')
    .map((chair) => {
      const id = chairIdOf(layout.rowId, chair.side, chair.index);
      const faded = chair.state === 'leftOut';

      return {
        key: id,
        id: faded ? id : layout.rowId,
        x: chair.center.x,
        y: chair.center.y,
        rotation: chair.rotation,
        widthCm: chair.slotWidth,
        depthCm: standard.chairDepthCm,
        conflict: conflictChairs.has(id),
        faded,
      };
    });

const chairSizeOf = (standard: SeatingStandard): { widthCm: number; depthCm: number } => ({
  widthCm: Math.min(CHAIR_WIDTH_CM, standard.maximumChairSpacingCm - CHAIR_GAP_CM),
  depthCm: Math.min(CHAIR_WIDTH_CM, standard.chairDepthCm * CHAIR_DEPTH_SHARE),
});

const BACKREST_TURN = 180;

const chairsOf = (
  layout: RowLayout,
  standard: SeatingStandard,
  selection: PlannerSelection,
  conflictChairs: ReadonlySet<string>,
): SceneChair[] => {
  const size = chairSizeOf(standard);

  return layout.chairs.map((chair) => {
    const ref = { rowId: layout.rowId, side: chair.side, index: chair.index };
    const id = chairIdOf(layout.rowId, chair.side, chair.index);

    return {
      key: id,
      id,
      x: chair.center.x,
      y: chair.center.y,
      rotation: (chair.rotation + BACKREST_TURN) % 360,
      widthCm: size.widthCm,
      depthCm: size.depthCm,
      number: chair.number,
      hasNote: chair.note !== null,
      removed: chair.state === 'removed',
      faded: chair.state === 'leftOut',
      conflict: conflictChairs.has(id),
      selected: isChairSelected(selection, ref),
    };
  });
};

const singleFrameOf = (
  layout: RowLayout,
  type: TableType,
  standard: SeatingStandard,
): SceneFrame => ({
  x: layout.center.x,
  y: layout.center.y,
  widthCm: rowSpanOf(layout.tableCount, type, standard.chairDepthCm),
  heightCm: type.shape === 'round' ? type.lengthCm : type.widthCm,
  rotation: layout.rotation,
});

const boundsFrameOf = (bounds: Bounds): SceneFrame => {
  const center = boundsCenter(bounds);

  return {
    x: center.x,
    y: center.y,
    widthCm: bounds.maxX - bounds.minX,
    heightCm: bounds.maxY - bounds.minY,
    rotation: 0,
  };
};

export const frameOf = (
  layouts: readonly RowLayout[],
  types: ReadonlyMap<number, TableType>,
  document: TablePlanDocument,
  standard: SeatingStandard,
  rowIds: readonly string[],
): SceneFrame | null => {
  const chosen = layouts.filter((layout) => rowIds.includes(layout.rowId));
  const only = chosen.length === 1 ? chosen[0] : undefined;
  if (only !== undefined) {
    const row = document.rows.find((candidate) => candidate.id === only.rowId);
    const type = row === undefined ? undefined : types.get(row.tableTypeId);

    return type === undefined ? null : singleFrameOf(only, type, standard);
  }
  const bounds = unionBounds(chosen.flatMap((layout) => layout.body.map(boundsOfShape)));

  return bounds === null ? null : boundsFrameOf(bounds);
};

export const plannerSceneOf = ({
  document,
  layouts,
  types,
  standard,
  findings,
  selection,
  view,
  focusedFinding,
}: SceneInput): PlannerScene => {
  const selected = selectedRowIdsOf(selection);
  const conflictChairs = conflictChairsOf(findings);
  const conflictRows = conflictRowsOf(findings);
  const rowsById = new Map(document.rows.map((row) => [row.id, row]));
  const tables: SceneTable[] = [];
  const cells: SceneCell[] = [];
  const chairs: SceneChair[] = [];
  const notes: SceneNote[] = [];

  for (const layout of layouts) {
    const row = rowsById.get(layout.rowId);
    const type = row === undefined ? undefined : types.get(row.tableTypeId);
    if (row === undefined || type === undefined) {
      continue;
    }
    tables.push(
      ...tablesOf(layout, type, row.number, selected.includes(row.id), conflictRows.has(row.id)),
    );
    if (view === 'plan') {
      cells.push(...cellsOf(layout, standard, conflictChairs));
    } else {
      chairs.push(...chairsOf(layout, standard, selection, conflictChairs));
    }
    if (row.note !== null) {
      notes.push({ key: row.id, at: layout.center });
    }
  }

  return {
    tables,
    cells,
    chairs,
    notes,
    findings: findings.map((finding) => ({
      key: finding.key,
      severity: finding.severity,
      kind: finding.kind,
      from: finding.from,
      to: finding.to,
      distanceCm: finding.distanceCm,
      selected: finding.key === focusedFinding,
    })),
    frame: frameOf(layouts, types, document, standard, selected),
  };
};

export const parseChairId = (
  id: string,
): { rowId: string; side: ChairSide; index: number } | null => {
  const [prefix, rowId, side, index] = id.split(CHAIR_ID_SEPARATOR);
  const parsedIndex = Number(index);
  if (
    prefix !== CHAIR_ID_PREFIX ||
    rowId === undefined ||
    !isChairSide(side) ||
    !Number.isInteger(parsedIndex)
  ) {
    return null;
  }

  return { rowId, side, index: parsedIndex };
};

const CHAIR_SIDE_VALUES: readonly ChairSide[] = ['front', 'back', 'start', 'end', 'around'];

const isChairSide = (value: string | undefined): value is ChairSide =>
  CHAIR_SIDE_VALUES.some((side) => side === value);
