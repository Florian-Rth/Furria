import { useIsMediumScreen } from '@furria/ui/use-is-medium-screen';
import { useState } from 'react';
import { hallBounds } from '@/features/hall-plan/hall-ops';
import { blockersOf } from '@/features/hall-plan/plan-blockers';
import type { ClearanceFinding, FindingTally } from '@/features/hall-plan/plan-clearance';
import { clearanceOf, tallyFindings } from '@/features/hall-plan/plan-clearance';
import type { Bounds } from '@/features/hall-plan/plan-geometry';
import { boundsFromCorners, unionBounds } from '@/features/hall-plan/plan-geometry';
import type {
  Point,
  SeatingResponse,
  SeatingStandard,
  TablePlanDocument,
  TablePlanResponse,
  TableType,
} from '@/features/hall-plan/schemas';
import type { SeatOffer, SeatRequestShape } from '@/features/hall-plan/seat-request';
import { DEFAULT_TABLES_PER_ROW, seatOfferOf } from '@/features/hall-plan/seat-request';
import type { PlanCounts, RowLayout } from '@/features/hall-plan/table-layout';
import { layoutPlan, planCountsOf, tableTypesById } from '@/features/hall-plan/table-layout';
import { layoutsBounds } from '@/features/hall-plan/table-plan-ops';
import type { PlannerKeyCommand } from '../planner-keys';
import type { PlannerScene } from '../planner-scene';
import { plannerSceneOf } from '../planner-scene';
import type { InspectorTarget, PlannerSelection } from '../planner-selection';
import { inspectorTargetOf, NO_SELECTION, pruneSelection } from '../planner-selection';
import type { PlannerTool, PlannerView } from '../planner-tools';
import type { PlanEditor } from './use-plan-editor';
import { usePlanEditor } from './use-plan-editor';
import type { PlannerCommands } from './use-planner-commands';
import { usePlannerCommands } from './use-planner-commands';
import { usePlannerKeys } from './use-planner-keys';
import type { PlannerPointer } from './use-planner-pointer';
import { usePlannerPointer } from './use-planner-pointer';
import type { PlannerViewport } from './use-planner-viewport';
import { usePlannerViewport } from './use-planner-viewport';

const EMPTY_HALL_BOUNDS: Bounds = { minX: 0, minY: 0, maxX: 2000, maxY: 1200 };

export type PlannerDrawer = 'inspector' | 'findings' | 'settings' | null;

export interface SeatRequestDraft {
  seats: number;
  shape: SeatRequestShape;
  tablesPerRow: number;
}

const DEFAULT_SEAT_REQUEST: SeatRequestDraft = {
  seats: 20,
  shape: 'row',
  tablesPerRow: DEFAULT_TABLES_PER_ROW,
};

export interface TablePlanner {
  plan: TablePlanResponse;
  standard: SeatingStandard;
  tableTypes: readonly TableType[];
  activeTypes: readonly TableType[];
  types: ReadonlyMap<number, TableType>;
  editor: PlanEditor;
  layouts: readonly RowLayout[];
  findings: readonly ClearanceFinding[];
  tally: FindingTally;
  counts: PlanCounts;
  scene: PlannerScene;
  ghostScene: PlannerScene | null;
  ghostCounts: PlanCounts | null;
  tool: PlannerTool;
  setTool: (tool: PlannerTool) => void;
  view: PlannerView;
  setView: (view: PlannerView) => void;
  paletteType: TableType | null;
  setPaletteType: (tableTypeId: number) => void;
  seatRequest: SeatRequestDraft;
  changeSeatRequest: (patch: Partial<SeatRequestDraft>) => void;
  seatOffer: SeatOffer | null;
  selection: PlannerSelection;
  select: (selection: PlannerSelection) => void;
  target: InspectorTarget;
  pointer: PlannerPointer;
  viewport: PlannerViewport;
  commands: PlannerCommands;
  isDesk: boolean;
  drawer: PlannerDrawer;
  openDrawer: (drawer: PlannerDrawer) => void;
  focusedFinding: string | null;
  focusFinding: (finding: ClearanceFinding) => void;
}

const contentBoundsOf = (plan: TablePlanResponse, layouts: readonly RowLayout[]): Bounds =>
  unionBounds([hallBounds(plan.hall.document), layoutsBounds(layouts)]) ?? EMPTY_HALL_BOUNDS;

export const useTablePlanner = (
  plan: TablePlanResponse,
  seating: SeatingResponse,
  onConflict: () => void,
): TablePlanner => {
  const isDesk = useIsMediumScreen();
  const standard = seating.standard;
  const types = tableTypesById(seating.tableTypes);
  const blockers = blockersOf(plan.hall.document, standard);
  const countsOf = (next: TablePlanDocument): PlanCounts =>
    planCountsOf(layoutPlan(next, types, standard, blockers));
  const editor = usePlanEditor(plan, onConflict, countsOf);
  const activeTypes = seating.tableTypes.filter((type) => !type.archived);
  const [tool, setTool] = useState<PlannerTool>('select');
  const [view, setView] = useState<PlannerView>('plan');
  const [paletteTypeId, setPaletteTypeId] = useState<number | null>(null);
  const [rawSelection, setSelection] = useState<PlannerSelection>(NO_SELECTION);
  const [drawer, setDrawer] = useState<PlannerDrawer>(null);
  const [focusedFinding, setFocusedFinding] = useState<string | null>(null);
  const [seatRequest, setSeatRequest] = useState<SeatRequestDraft>(DEFAULT_SEAT_REQUEST);
  const document = editor.document;
  const selection = pruneSelection(document, rawSelection);
  const layouts = layoutPlan(document, types, standard, blockers);
  const findings = clearanceOf(layouts, blockers, standard);
  const viewport = usePlannerViewport(contentBoundsOf(plan, layouts));
  const paletteType =
    activeTypes.find((type) => type.tableTypeId === paletteTypeId) ?? activeTypes[0] ?? null;
  const select = (next: PlannerSelection): void => {
    setSelection(next);
  };
  const seatOfferAt = (center: Point): SeatOffer | null =>
    paletteType === null
      ? null
      : seatOfferOf(
          document,
          { ...seatRequest, type: paletteType, seating: document.seating },
          standard,
          center,
        );
  const commands = usePlannerCommands({ editor, layouts, types, standard, selection, select });
  const pointer = usePlannerPointer({
    editor,
    hall: plan.hall.document,
    layouts,
    standard,
    paletteType,
    types,
    seatOfferAt,
    tool,
    scale: viewport.view.scale,
    selection,
    select,
    panBy: viewport.panBy,
    onTap: () => {
      if (!isDesk) {
        setDrawer('inspector');
      }
    },
  });
  const ghostDocument: TablePlanDocument | null =
    pointer.ghost.length === 0
      ? null
      : {
          ...document,
          rows: [...pointer.ghost],
          groups: [...new Set(pointer.ghost.flatMap((row) => row.groupId ?? []))].map((id) => ({
            id,
            number: null,
            note: null,
          })),
        };
  const ghostLayouts = ghostDocument === null ? [] : layoutPlan(ghostDocument, types, standard);
  const ghostScene =
    ghostDocument === null
      ? null
      : plannerSceneOf({
          document: ghostDocument,
          layouts: ghostLayouts,
          types,
          standard,
          findings: [],
          selection: NO_SELECTION,
          view: 'plan',
          focusedFinding: null,
        });

  const changeTool = (next: PlannerTool): void => {
    setTool(next);
    pointer.cancel();
    if (next !== 'measure') {
      pointer.clearMeasure();
    }
  };

  const runKey = (command: PlannerKeyCommand): void => {
    switch (command.kind) {
      case 'undo':
        editor.undo();
        return;
      case 'redo':
        editor.redo();
        return;
      case 'delete':
        commands.remove();
        return;
      case 'duplicate':
        commands.duplicate();
        return;
      case 'escape':
        pointer.cancel();
        pointer.clearMeasure();
        setSelection(NO_SELECTION);
        setTool('select');
        return;
      case 'selectAll':
        commands.selectAll();
        return;
      case 'group':
        commands.group();
        return;
      case 'ungroup':
        commands.ungroup();
        return;
      case 'nudge':
        commands.nudge(command.delta);
        return;
      case 'count':
        commands.changeCount(command.delta);
        return;
      case 'rotate':
        commands.rotate(command.degrees);
        return;
      case 'tool':
        changeTool(command.tool);
        return;
    }
  };

  usePlannerKeys(runKey);

  return {
    plan,
    standard,
    tableTypes: seating.tableTypes,
    activeTypes,
    types,
    editor,
    layouts,
    findings,
    tally: tallyFindings(findings),
    counts: planCountsOf(layouts),
    scene: plannerSceneOf({
      document,
      layouts,
      types,
      standard,
      findings,
      selection,
      view,
      focusedFinding,
    }),
    ghostScene,
    ghostCounts: ghostDocument === null ? null : planCountsOf(ghostLayouts),
    tool,
    setTool: changeTool,
    view,
    setView: (next) => {
      setView(next);
      if (next === 'plan' && selection.kind === 'chair') {
        setSelection(NO_SELECTION);
      }
    },
    paletteType,
    setPaletteType: (tableTypeId) => {
      setPaletteTypeId(tableTypeId);
      if (tool === 'select' || tool === 'measure') {
        changeTool('table');
      }
    },
    seatRequest,
    changeSeatRequest: (patch) => {
      setSeatRequest((current) => ({ ...current, ...patch }));
    },
    seatOffer: seatOfferAt({ x: 0, y: 0 }),
    selection,
    select,
    target: inspectorTargetOf(document, selection),
    pointer,
    viewport,
    commands,
    isDesk,
    drawer,
    openDrawer: setDrawer,
    focusedFinding,
    focusFinding: (finding) => {
      setFocusedFinding(finding.key);
      viewport.focus(boundsFromCorners(finding.from, finding.to));
      setDrawer(null);
    },
  };
};
