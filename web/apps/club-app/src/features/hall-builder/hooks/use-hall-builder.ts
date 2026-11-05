import type { KkPlanView, KkPlanViewportSize } from '@furria/ui/floor-plan-view';
import { DEFAULT_PLAN_VIEW, panPlanBy } from '@furria/ui/floor-plan-view';
import type { KkFloorPlanHandle, KkPlanPointerEvent } from '@furria/ui/KkFloorPlan';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useIsMobile } from '@furria/ui/use-is-mobile';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  duplicateElements,
  elementBounds,
  findElement,
  hallBounds,
  hitTestHall,
  mergeAreas,
  moveElements,
  removeElements,
  replaceElement,
  rotateElements,
  selectionBounds,
} from '@/features/hall-plan/hall-ops';
import type { Bounds } from '@/features/hall-plan/plan-geometry';
import { padBounds } from '@/features/hall-plan/plan-geometry';
import type { PlanHistory } from '@/features/hall-plan/plan-history';
import {
  canRedo,
  canUndo,
  commit,
  createHistory,
  endCoalescing,
  redo,
  undo,
} from '@/features/hall-plan/plan-history';
import { thresholdInCm } from '@/features/hall-plan/plan-snap';
import type { ActionBarAnchor, TouchTarget } from '@/features/hall-plan/plan-touch';
import {
  actionBarAnchorOf,
  actionBarWidthOf,
  hitTolerancePxOf,
  revealPanOf,
  screenRectOf,
  touchTargetOf,
  visibleRectOf,
} from '@/features/hall-plan/plan-touch';
import type {
  AreaKind,
  HallDetails,
  HallDocument,
  HallElement,
  Point,
} from '@/features/hall-plan/schemas';
import { usePlanTouchMode } from '@/features/hall-plan/use-plan-touch-mode';
import type { TouchStyle } from '@/features/hall-plan/use-touch-gestures';
import { useTouchGestures } from '@/features/hall-plan/use-touch-gestures';
import type { AreaMergeState } from '../hall-area-merge';
import { areaMergeStateOf, selectedAreaCountOf } from '../hall-area-merge';
import type { HallTool } from '../hall-builder-tools';
import { isHallTool } from '../hall-builder-tools';
import type { GestureContext, GesturePointer, GestureResult, HallDraft } from '../hall-gesture';
import {
  doubleClick,
  dropLastPoint,
  finishPolyline,
  IDLE_DRAFT,
  pointerCancel,
  pointerDown,
  pointerMove,
  pointerUp,
  previewDocument,
} from '../hall-gesture';
import type { HallCommand } from '../hall-keys';
import type { HallOverlay } from '../hall-overlay';
import { overlayOf } from '../hall-overlay';
import type { HallSaveState } from './use-hall-autosave';
import { useHallAutosave } from './use-hall-autosave';
import { useHallKeyboard } from './use-hall-keyboard';

const EMPTY_HALL_BOUNDS: Bounds = { minX: 0, minY: 0, maxX: 2000, maxY: 1500 };
const FIT_MARGIN_CM = 100;
const FOCUS_MARGIN_CM = 300;
const ROTATE_STEP_DEGREES = 15;
const ACTION_BUTTONS = 5;
const UNMEASURED: KkPlanViewportSize = { width: 0, height: 0 };

const touchStyleOf = (isTouch: boolean, tool: HallTool): TouchStyle => {
  if (!isTouch) {
    return 'off';
  }
  if (tool === 'wall' || tool === 'line') {
    return 'polyline';
  }

  return tool === 'select' || tool === 'pillar' || tool === 'text' ? 'tap' : 'off';
};

export interface HallBuilder {
  hall: HallDetails;
  origin: KkScreenOrigin;
  document: HallDocument;
  overlay: HallOverlay;
  selection: readonly string[];
  selected: readonly HallElement[];
  tool: HallTool;
  draft: HallDraft;
  view: KkPlanView;
  planRef: RefObject<KkFloorPlanHandle | null>;
  name: string;
  saveState: HallSaveState;
  canUndo: boolean;
  canRedo: boolean;
  isPhone: boolean;
  isTouch: boolean;
  hasSideSheet: boolean;
  usesBottomSheet: boolean;
  isInspectorOpen: boolean;
  isAddSheetOpen: boolean;
  actionBar: ActionBarAnchor | null;
  loupe: Point | null;
  setViewportSize: (size: KkPlanViewportSize) => void;
  openAddSheet: () => void;
  closeAddSheet: () => void;
  pickTool: (tool: HallTool) => void;
  finishTool: () => void;
  dropLastPoint: () => void;
  inspectSelection: () => void;
  inspectHall: () => void;
  chooseTool: (tool: string) => void;
  changeView: (view: KkPlanView) => void;
  rename: (name: string) => void;
  undo: () => void;
  redo: () => void;
  fit: () => void;
  down: (event: KkPlanPointerEvent) => void;
  move: (event: KkPlanPointerEvent) => void;
  up: (event: KkPlanPointerEvent) => void;
  cancel: (event: KkPlanPointerEvent) => void;
  doubleClick: () => void;
  finishDraft: () => void;
  dropDraft: () => void;
  updateElement: (element: HallElement, field: string) => void;
  areaMerge: AreaMergeState;
  mergeSelectedAreas: () => void;
  deleteSelection: () => void;
  duplicateSelection: () => void;
  rotateSelection: (degrees: number) => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  openInspector: () => void;
  closeInspector: () => void;
}

const pointerOf = (event: KkPlanPointerEvent): GesturePointer => ({
  at: { x: event.x, y: event.y },
  screen: { x: event.screenX, y: event.screenY },
  handleId: event.handleId,
  shiftKey: event.shiftKey,
  altKey: event.altKey,
  pointerType: event.pointerType,
});

const fitBoundsOf = (document: HallDocument): Bounds =>
  padBounds(hallBounds(document) ?? EMPTY_HALL_BOUNDS, FIT_MARGIN_CM);

export const useHallBuilder = (
  hall: HallDetails,
  origin: KkScreenOrigin,
  onConflict: () => void,
): HallBuilder => {
  const isPhone = useIsMobile();
  const touchMode = usePlanTouchMode();
  const [viewportSize, setViewportSize] = useState<KkPlanViewportSize>(UNMEASURED);
  const [isAddSheetOpen, setAddSheetOpen] = useState(false);
  const [history, setHistory] = useState<PlanHistory<HallDocument>>(() =>
    createHistory(hall.document),
  );
  const [selection, setSelection] = useState<readonly string[]>([]);
  const [tool, setTool] = useState<HallTool>('select');
  const [draft, setDraft] = useState<HallDraft>(IDLE_DRAFT);
  const [areaKind, setAreaKind] = useState<AreaKind>('stage');
  const [view, setView] = useState<KkPlanView>(DEFAULT_PLAN_VIEW);
  const [name, setName] = useState(hall.name);
  const [isInspectorOpen, setInspectorOpen] = useState(false);
  const planRef = useRef<KkFloorPlanHandle | null>(null);
  const present = history.present;
  const saveState = useHallAutosave({
    hallId: hall.hallId,
    version: hall.version,
    content: { name, document: present },
    onConflict,
  });

  useEffect(() => {
    planRef.current?.fit(fitBoundsOf(hall.document));
  }, [hall.document]);

  const context: GestureContext = {
    document: present,
    selection,
    tool,
    scale: view.scale,
    areaKind,
    hitTolerancePx: hitTolerancePxOf(touchMode.isTouch),
  };

  const apply = (next: HallDocument, coalesceKey: string | null = null): void => {
    setHistory((current) => commit(current, next, coalesceKey));
  };

  const settle = (result: GestureResult): void => {
    setDraft(result.draft);
    if (result.document !== undefined) {
      apply(result.document);
    }
    if (result.selection !== undefined) {
      setSelection(result.selection);
    }
    if (result.tool !== undefined) {
      setTool(result.tool);
    }
    if (result.pan !== undefined) {
      const pan = result.pan;
      setView((current) => panPlanBy(current, pan.x, pan.y));
    }
  };

  const chooseTool = (next: string): void => {
    if (!isHallTool(next)) {
      return;
    }
    setTool(next);
    setDraft(IDLE_DRAFT);
  };

  const deleteSelection = (): void => {
    if (selection.length === 0) {
      return;
    }
    apply(removeElements(present, selection));
    setSelection([]);
    setInspectorOpen(false);
  };

  const duplicateSelection = (): void => {
    if (selection.length === 0) {
      return;
    }
    const copy = duplicateElements(present, selection);
    apply(copy.document);
    setSelection(copy.ids);
  };

  const rotateSelection = (degrees: number): void => {
    if (selection.length > 0) {
      apply(rotateElements(present, selection, degrees));
    }
  };

  const fit = (): void => {
    planRef.current?.fit(fitBoundsOf(present));
  };

  const stepBack = (): void => {
    if (draft.kind !== 'idle') {
      setDraft(IDLE_DRAFT);
      return;
    }
    setSelection([]);
    setInspectorOpen(false);
  };

  const runCommand = (command: HallCommand): void => {
    switch (command.kind) {
      case 'undo':
        setHistory(undo);
        return;
      case 'redo':
        setHistory(redo);
        return;
      case 'delete':
        deleteSelection();
        return;
      case 'duplicate':
        duplicateSelection();
        return;
      case 'nudge':
        if (selection.length > 0) {
          apply(moveElements(present, selection, command.delta), 'nudge');
        }
        return;
      case 'escape':
        stepBack();
        return;
      case 'finish':
        settle(finishPolyline(present, draft));
        return;
      case 'tool':
        chooseTool(command.tool);
        return;
    }
  };

  useHallKeyboard(runCommand);

  const updateElement = (element: HallElement, field: string): void => {
    apply(replaceElement(present, element), `field:${element.id}:${field}`);
    if (element.kind === 'area') {
      setAreaKind(element.area);
    }
  };

  const merge =
    selectedAreaCountOf(present, selection) >= 2 ? mergeAreas(present, selection) : null;

  const mergeSelectedAreas = (): void => {
    if (merge?.kind === 'merged') {
      apply(merge.document);
      setSelection([merge.id]);
    }
  };

  const preview = previewDocument(present, draft);

  const rawDown = (event: KkPlanPointerEvent): void => {
    setHistory(endCoalescing);
    settle(pointerDown(context, draft, pointerOf(event)));
  };
  const rawMove = (event: KkPlanPointerEvent): void => {
    if (draft.kind !== 'idle') {
      settle(pointerMove(context, draft, pointerOf(event)));
    }
  };
  const rawUp = (): void => {
    settle(pointerUp(context, draft));
  };
  const rawCancel = (): void => {
    setDraft(pointerCancel(draft));
  };
  const panBy = (deltaX: number, deltaY: number): void => {
    setView((current) => panPlanBy(current, deltaX, deltaY));
  };
  const focusOn = (target: TouchTarget): void => {
    const element = target.id === null ? null : findElement(present, target.id);
    if (element === null) {
      fit();
      return;
    }
    planRef.current?.fit(padBounds(elementBounds(element), FOCUS_MARGIN_CM));
  };
  const touch = useTouchGestures({
    style: touchStyleOf(touchMode.isTouch, tool),
    canSelect: tool === 'select',
    scale: view.scale,
    targetOf: (event) =>
      tool === 'select'
        ? touchTargetOf(
            event.handleId,
            hitTestHall(present, event, thresholdInCm(context.hitTolerancePx, view.scale)),
            (id) => selection.includes(id),
          )
        : touchTargetOf(null, null, () => false),
    forward: { down: rawDown, move: rawMove, up: rawUp, cancel: rawCancel },
    panBy,
    zoomTo: focusOn,
  });

  const mergeState = areaMergeStateOf(merge);
  const selectedBounds = selectionBounds(present, selection);
  const isMeasured = viewportSize.width > 0 && viewportSize.height > 0;
  const showsActionBar =
    touchMode.isTouch &&
    tool === 'select' &&
    draft.kind === 'idle' &&
    selectedBounds !== null &&
    isMeasured;
  const selectedRect =
    selectedBounds === null ? null : screenRectOf(selectedBounds, view, viewportSize);
  const actionBar =
    showsActionBar && selectedRect !== null
      ? actionBarAnchorOf(
          selectedRect,
          viewportSize,
          actionBarWidthOf(ACTION_BUTTONS + (mergeState === 'hidden' ? 0 : 1), 0),
        )
      : null;
  const usesBottomSheet = touchMode.isTouch ? !touchMode.hasSideSheet : isPhone;
  const inspectSelection = (): void => {
    setInspectorOpen(true);
    if (selectedRect === null || !isMeasured) {
      return;
    }
    const shift = revealPanOf(
      selectedRect,
      visibleRectOf(viewportSize, touchMode.hasSideSheet ? 'side' : 'bottom'),
    );
    panBy(shift.x, shift.y);
  };
  const pickTool = (next: HallTool): void => {
    chooseTool(next);
    setAddSheetOpen(false);
    setSelection([]);
  };

  return {
    hall,
    origin,
    document: preview,
    overlay: overlayOf(preview, selection, draft, tool, areaKind),
    selection,
    selected: present.elements.filter((element) => selection.includes(element.id)),
    tool,
    draft,
    view,
    planRef,
    name,
    saveState,
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    isPhone,
    isTouch: touchMode.isTouch,
    hasSideSheet: touchMode.hasSideSheet,
    usesBottomSheet,
    isInspectorOpen,
    isAddSheetOpen,
    actionBar,
    loupe: touch.loupe,
    setViewportSize,
    openAddSheet: () => {
      setAddSheetOpen(true);
    },
    closeAddSheet: () => {
      setAddSheetOpen(false);
    },
    pickTool,
    finishTool: () => {
      settle(finishPolyline(present, draft));
      setTool('select');
    },
    dropLastPoint: () => {
      setDraft(dropLastPoint(draft));
    },
    inspectSelection,
    inspectHall: () => {
      setSelection([]);
      setInspectorOpen(true);
    },
    chooseTool,
    changeView: setView,
    rename: setName,
    undo: () => {
      setHistory(undo);
    },
    redo: () => {
      setHistory(redo);
    },
    fit,
    down: touch.down,
    move: touch.move,
    up: touch.up,
    cancel: touch.cancel,
    doubleClick: () => {
      settle(doubleClick(context, draft));
    },
    finishDraft: () => {
      settle(finishPolyline(present, draft));
    },
    dropDraft: () => {
      setDraft(IDLE_DRAFT);
    },
    updateElement,
    areaMerge: mergeState,
    mergeSelectedAreas,
    deleteSelection,
    duplicateSelection,
    rotateSelection,
    rotateLeft: () => {
      rotateSelection(-ROTATE_STEP_DEGREES);
    },
    rotateRight: () => {
      rotateSelection(ROTATE_STEP_DEGREES);
    },
    openInspector: () => {
      setInspectorOpen(true);
    },
    closeInspector: () => {
      setInspectorOpen(false);
    },
  };
};
