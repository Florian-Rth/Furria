import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useSaveTablePlanMutation } from '@/features/hall-plan/api';
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
import { isPlanVersionConflict } from '@/features/hall-plan/requests';
import type { TablePlanDocument, TablePlanResponse } from '@/features/hall-plan/schemas';
import type { PlanCounts } from '@/features/hall-plan/table-layout';

const AUTOSAVE_DELAY_MS = 800;

export interface PlanEditor {
  document: TablePlanDocument;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  apply: (next: TablePlanDocument, coalesceKey?: string | null) => void;
  settle: () => void;
  undo: () => void;
  redo: () => void;
}

export const usePlanEditor = (
  plan: TablePlanResponse,
  onConflict: () => void,
  countsOf: (document: TablePlanDocument) => PlanCounts,
): PlanEditor => {
  const [history, setHistory] = useState<PlanHistory<TablePlanDocument>>(() =>
    createHistory(plan.document),
  );
  const save = useSaveTablePlanMutation(plan.eventId);
  const version = useRef(plan.version);
  const saved = useRef(plan.document);
  const latest = useRef(plan.document);
  const inFlight = useRef(false);
  const queued = useRef(false);

  const flush = useEffectEvent((): void => {
    const document = latest.current;
    if (document === saved.current) {
      return;
    }
    if (inFlight.current) {
      queued.current = true;

      return;
    }
    inFlight.current = true;
    save.mutate(
      { hallId: plan.hallId, document, version: version.current, ...countsOf(document) },
      {
        onSuccess: (result) => {
          version.current = result.version;
          saved.current = document;
        },
        onError: (error) => {
          if (isPlanVersionConflict(error)) {
            queued.current = false;
            onConflict();
          }
        },
        onSettled: () => {
          inFlight.current = false;
          if (queued.current) {
            queued.current = false;
            flush();
          }
        },
      },
    );
  });

  useEffect(() => {
    latest.current = history.present;
    if (history.present === saved.current) {
      return;
    }
    const timer = window.setTimeout(flush, AUTOSAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [history.present]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent): void => {
      if (latest.current !== saved.current) {
        flush();
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', warn);

    return () => {
      window.removeEventListener('beforeunload', warn);
      flush();
    };
  }, []);

  return {
    document: history.present,
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    isSaving: save.isPending,
    apply: (next, coalesceKey = null) => {
      setHistory((current) => commit(current, next, coalesceKey));
    },
    settle: () => {
      setHistory(endCoalescing);
    },
    undo: () => {
      setHistory(undo);
    },
    redo: () => {
      setHistory(redo);
    },
  };
};
