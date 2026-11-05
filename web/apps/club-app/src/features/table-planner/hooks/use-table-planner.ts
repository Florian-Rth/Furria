import { panPlanBy } from '@furria/ui/floor-plan-view';
import type { KkPlanPointerEvent } from '@furria/ui/KkFloorPlan';
import { useIsMediumScreen } from '@furria/ui/use-is-medium-screen';
import { useRef, useState } from 'react';
import { hallBounds } from '@/features/hall-plan/hall-ops';
import { blockersOf } from '@/features/hall-plan/plan-blockers';
import type { ClearanceFinding, FindingTally } from '@/features/hall-plan/plan-clearance';
import { clearanceOf, tallyFindings } from '@/features/hall-plan/plan-clearance';
import type { Bounds } from '@/features/hall-plan/plan-geometry';
import { boundsFromCorners, padBounds, unionBounds } from '@/features/hall-plan/plan-geometry';
import { thresholdInCm } from '@/features/hall-plan/plan-snap';
import type { ActionBarAnchor, TouchTarget } from '@/features/hall-plan/plan-touch';
import {
  actionBarAnchorOf,
  hitTolerancePxOf,
  revealPanOf,
  screenRectOf,
  visibleRectOf,
} from '@/features/hall-plan/plan-touch';
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
import { layoutsBounds, selectionFor } from '@/features/hall-plan/table-plan-ops';
import { usePlanTouchMode } from '@/features/hall-plan/use-plan-touch-mode';
import type { PlanPointerHandlers, TouchStyle } from '@/features/hall-plan/use-touch-gestures';
import { useTouchGestures } from '@/features/hall-plan/use-touch-gestures';
import type { PlannerKeyCommand } from '../planner-keys';
import type { PlannerScene } from '../planner-scene';
import { plannerSceneOf } from '../planner-scene';
import type { InspectorTarget, PlannerSelection } from '../planner-selection';
import { inspectorTargetOf, NO_SELECTION, pruneSelection } from '../planner-selection';
import type { PlannerTool, PlannerView } from '../planner-tools';
import type { PlannerActionKind } from '../planner-touch';
import {
  actionBarWidthFor,
  actionKindOf,
  draggedPoint,
  plannerTouchTargetOf,
  selectionBoundsOf,
  touchTargetBoundsOf,
} from '../planner-touch';
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
const FOCUS_MARGIN_CM = 200;

const touchStyleOf = (isTouch: boolean, tool: PlannerTool): TouchStyle =>
  isTouch && (tool === 'select' || tool === 'table') ? 'tap' : 'off';

interface SeatsDrag {
  last: Point;
  moved: boolean;
}

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
  isTouch: boolean;
  hasSideSheet: boolean;
  usesBottomSheet: boolean;
  input: PlanPointerHandlers;
  loupe: Point | null;
  actionBar: ActionBarAnchor | null;
  actionKind: PlannerActionKind | null;
  isAddSheetOpen: boolean;
  openAddSheet: () => void;
  closeAddSheet: () => void;
  pickTool: (tool: PlannerTool) => void;
  finishTool: () => void;
  placeSeatsHere: () => void;
  inspectSelection: () => void;
  inspectPlan: () => void;
}

const contentBoundsOf = (plan: TablePlanResponse, layouts: readonly RowLayout[]): Bounds =>
  unionBounds([hallBounds(plan.hall.document), layoutsBounds(layouts)]) ?? EMPTY_HALL_BOUNDS;

export const useTablePlanner = (
  plan: TablePlanResponse,
  seating: SeatingResponse,
  onConflict: () => void,
): TablePlanner => {
  const isDesk = useIsMediumScreen();
  const touchMode = usePlanTouchMode();
  const [isAddSheetOpen, setAddSheetOpen] = useState(false);
  const seatsDrag = useRef<SeatsDrag | null>(null);
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
      if (!isDesk && !touchMode.isTouch) {
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
    const centre = { x: viewport.view.centerX, y: viewport.view.centerY };
    pointer.setHover(touchMode.isTouch && next === 'seats' ? centre : null);
  };

  const panBy = (deltaX: number, deltaY: number): void => {
    viewport.setView(panPlanBy(viewport.view, deltaX, deltaY));
  };
  const zoomTo = (target: TouchTarget): void => {
    const bounds = touchTargetBoundsOf(layouts, (rowId) => selectionFor(document, rowId), target);
    if (bounds === null) {
      viewport.fit();
      return;
    }
    viewport.focus(padBounds(bounds, FOCUS_MARGIN_CM));
  };
  const hover = pointer.overlay.hover;
  const seatsInput: PlanPointerHandlers = {
    down: (event) => {
      seatsDrag.current = { last: { x: event.x, y: event.y }, moved: false };
    },
    move: (event) => {
      const drag = seatsDrag.current;
      if (drag === null || hover === null) {
        return;
      }
      pointer.setHover(draggedPoint(hover, drag.last, event));
      seatsDrag.current = { last: { x: event.x, y: event.y }, moved: true };
    },
    up: (event: KkPlanPointerEvent) => {
      if (seatsDrag.current?.moved === false) {
        pointer.setHover({ x: event.x, y: event.y });
      }
      seatsDrag.current = null;
    },
    cancel: () => {
      seatsDrag.current = null;
    },
  };
  const usesSeatsInput = touchMode.isTouch && tool === 'seats';
  const touch = useTouchGestures({
    style: touchStyleOf(touchMode.isTouch, tool),
    canSelect: tool === 'select',
    scale: viewport.view.scale,
    targetOf: (event) =>
      plannerTouchTargetOf(layouts, selection, {
        handleId: event.handleId,
        targetId: event.targetId,
        at: event,
        view,
        tool,
        toleranceCm: thresholdInCm(hitTolerancePxOf(true), viewport.view.scale),
      }),
    forward: usesSeatsInput ? seatsInput : pointer,
    panBy,
    zoomTo,
  });

  const target = inspectorTargetOf(document, selection);
  const actionKind = actionKindOf(target);
  const size = viewport.size;
  const isMeasured = size.width > 0 && size.height > 0;
  const selectedBounds = selectionBoundsOf(layouts, selection);
  const selectedRect =
    selectedBounds === null || !isMeasured
      ? null
      : screenRectOf(selectedBounds, viewport.view, size);
  const actionBar =
    touchMode.isTouch && tool === 'select' && actionKind !== null && selectedRect !== null
      ? actionBarAnchorOf(selectedRect, size, actionBarWidthFor(actionKind))
      : null;
  const usesBottomSheet = touchMode.isTouch ? !touchMode.hasSideSheet : !isDesk;
  const inspectSelection = (): void => {
    setDrawer('inspector');
    if (selectedRect === null) {
      return;
    }
    const shift = revealPanOf(
      selectedRect,
      visibleRectOf(size, touchMode.hasSideSheet ? 'side' : 'bottom'),
    );
    panBy(shift.x, shift.y);
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
    target,
    pointer,
    viewport,
    commands,
    isDesk,
    drawer,
    openDrawer: setDrawer,
    focusedFinding,
    isTouch: touchMode.isTouch,
    hasSideSheet: touchMode.hasSideSheet,
    usesBottomSheet,
    input: touchMode.isTouch ? touch : pointer,
    loupe: touch.loupe,
    actionBar,
    actionKind,
    isAddSheetOpen,
    openAddSheet: () => {
      setAddSheetOpen(true);
    },
    closeAddSheet: () => {
      setAddSheetOpen(false);
    },
    pickTool: (next) => {
      changeTool(next);
      setSelection(NO_SELECTION);
      if (next !== 'seats') {
        setAddSheetOpen(false);
      }
    },
    finishTool: () => {
      changeTool('select');
    },
    placeSeatsHere: () => {
      if (hover !== null) {
        pointer.placeSeatsAt(hover);
        changeTool('select');
      }
    },
    inspectSelection,
    inspectPlan: () => {
      setSelection(NO_SELECTION);
      setDrawer('inspector');
    },
    focusFinding: (finding) => {
      setFocusedFinding(finding.key);
      viewport.focus(boundsFromCorners(finding.from, finding.to));
      setDrawer(null);
    },
  };
};
