import type { KkPlanView } from '@furria/ui/floor-plan-view';
import { DEFAULT_PLAN_VIEW, panPlanBy } from '@furria/ui/floor-plan-view';
import type { KkFloorPlanHandle, KkPlanPointerEvent } from '@furria/ui/KkFloorPlan';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useIsMobile } from '@furria/ui/use-is-mobile';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  duplicateElements,
  hallBounds,
  mergeAreas,
  moveElements,
  removeElements,
  replaceElement,
  rotateElements,
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
import type {
  AreaKind,
  HallDetails,
  HallDocument,
  HallElement,
} from '@/features/hall-plan/schemas';
import type { AreaMergeState } from '../hall-area-merge';
import { areaMergeStateOf, selectedAreaCountOf } from '../hall-area-merge';
import type { HallTool } from '../hall-builder-tools';
import { isHallTool } from '../hall-builder-tools';
import type { GestureContext, GesturePointer, GestureResult, HallDraft } from '../hall-gesture';
import {
  doubleClick,
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
const ROTATE_STEP_DEGREES = 15;

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
  isInspectorOpen: boolean;
  chooseTool: (tool: string) => void;
  changeView: (view: KkPlanView) => void;
  rename: (name: string) => void;
  undo: () => void;
  redo: () => void;
  fit: () => void;
  down: (event: KkPlanPointerEvent) => void;
  move: (event: KkPlanPointerEvent) => void;
  up: (event: KkPlanPointerEvent) => void;
  cancel: () => void;
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
    isInspectorOpen,
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
    down: (event) => {
      setHistory(endCoalescing);
      settle(pointerDown(context, draft, pointerOf(event)));
    },
    move: (event) => {
      if (draft.kind !== 'idle') {
        settle(pointerMove(context, draft, pointerOf(event)));
      }
    },
    up: () => {
      settle(pointerUp(context, draft));
    },
    cancel: () => {
      setDraft(pointerCancel(draft));
    },
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
    areaMerge: areaMergeStateOf(merge),
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
