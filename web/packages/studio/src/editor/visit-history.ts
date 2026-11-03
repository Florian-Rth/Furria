import type { SaveStatus } from '@furria/studio/autosave';

export interface VisitHistoryRow {
  key: string;
  label: string;
  meta: string;
  hint: string | undefined;
}

export interface VisitHistory {
  rows: VisitHistoryRow[];
  canUndo: boolean;
  canRedo: boolean;
  status: SaveStatus | null;
  undo: () => void;
  redo: () => void;
  retry: () => void;
}
