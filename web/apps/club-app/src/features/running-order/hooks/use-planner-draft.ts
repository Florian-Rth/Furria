import { useKkNotice } from '@furria/ui/KkNotice';
import { useEffect, useRef, useState } from 'react';
import {
  useConfirmRunningOrderMutation,
  useRunningOrderQuery,
  useSaveRunningOrderMutation,
} from '@/features/running-order/api';
import { isRunningOrderConflict } from '@/features/running-order/requests';
import { bodyOf, draftOf, EMPTY_DRAFT } from '@/features/running-order/running-order-ops';
import { reviewRunningOrder } from '@/features/running-order/running-order-review';
import type { RunningOrderResponse } from '@/features/running-order/schemas';
import type { ReviewFinding, RunningOrderDraft } from '@/features/running-order/types';
import { CONFLICT_RELOAD, RELOAD_LABEL, UNDO_LABEL } from '../planner-copy';
import type { HistoryStep, Rewind } from '../planner-history';
import { pushStep, rewindLatest, rewindTo } from '../planner-history';

export type SaveState = 'empty' | 'saved' | 'saving' | 'failed' | 'conflict';

interface DraftState {
  draft: RunningOrderDraft;
  history: HistoryStep[];
  revision: number;
  savedRevision: number;
  failed: boolean;
  conflict: boolean;
}

export interface PlannerDraft {
  isLoading: boolean;
  loadError: Error | null;
  draft: RunningOrderDraft;
  findings: ReviewFinding[];
  exists: boolean;
  saveState: SaveState;
  isDirty: boolean;
  confirmedAt: string | null;
  changedSinceConfirmed: boolean;
  isConfirming: boolean;
  canUndo: boolean;
  apply: (next: RunningOrderDraft, undoMessage?: string) => void;
  undo: () => void;
  reload: () => void;
  confirm: (confirmed: boolean) => void;
}

const SAVE_DELAY_MS = 700;

const freshState = (response: RunningOrderResponse | null): DraftState => ({
  draft: response === null ? EMPTY_DRAFT : draftOf(response),
  history: [],
  revision: 0,
  savedRevision: 0,
  failed: false,
  conflict: false,
});

const saveStateOf = (state: DraftState | null, exists: boolean, saving: boolean): SaveState => {
  if (state?.conflict === true) {
    return 'conflict';
  }
  if (saving || (state !== null && state.revision !== state.savedRevision && !state.failed)) {
    return 'saving';
  }
  if (state?.failed === true) {
    return 'failed';
  }

  return exists ? 'saved' : 'empty';
};

export const usePlannerDraft = (eventId: number): PlannerDraft => {
  const query = useRunningOrderQuery(eventId);
  const save = useSaveRunningOrderMutation(eventId);
  const confirmation = useConfirmRunningOrderMutation(eventId);
  const notify = useKkNotice();
  const [state, setState] = useState<DraftState | null>(null);
  const stepCounter = useRef(0);
  const { mutate: saveBody, isPending: saving } = save;
  const { refetch } = query;

  if (state === null && query.data !== undefined) {
    setState(freshState(query.data));
  }

  const isDirty =
    state !== null && state.revision !== state.savedRevision && !state.conflict && !state.failed;
  const pendingRevision = state?.revision ?? 0;
  const pendingDraft = state?.draft ?? null;

  const reload = (): void => {
    void refetch().then((result) => {
      if (result.data !== undefined) {
        setState(freshState(result.data));
      }
    });
  };

  useEffect(() => {
    if (!isDirty || saving || pendingDraft === null) {
      return;
    }

    const body = bodyOf(pendingDraft);
    const timer = window.setTimeout(() => {
      saveBody(body, {
        onSuccess: (saved) => {
          setState((previous) =>
            previous === null
              ? previous
              : {
                  ...previous,
                  draft: { ...previous.draft, version: saved.version },
                  savedRevision: Math.max(previous.savedRevision, pendingRevision),
                  failed: false,
                },
          );
        },
        onError: (error) => {
          const conflict = isRunningOrderConflict(error);

          setState((previous) =>
            previous === null ? previous : { ...previous, conflict, failed: !conflict },
          );
          if (conflict) {
            notify({
              tone: 'error',
              message: CONFLICT_RELOAD,
              actions: [
                {
                  id: 'reload',
                  label: RELOAD_LABEL,
                  onSelect: () => {
                    void refetch().then((result) => {
                      if (result.data !== undefined) {
                        setState(freshState(result.data));
                      }
                    });
                  },
                },
              ],
            });
          }
        },
      });
    }, SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isDirty, saving, pendingDraft, pendingRevision, saveBody, notify, refetch]);

  const rewind = (pick: (history: readonly HistoryStep[]) => Rewind | null): void => {
    setState((previous) => {
      const rewound = previous === null ? null : pick(previous.history);

      if (previous === null || rewound === null) {
        return previous;
      }

      return {
        ...previous,
        draft: { ...rewound.draft, version: previous.draft.version },
        history: rewound.history,
        revision: previous.revision + 1,
        failed: false,
      };
    });
  };

  const undo = (): void => {
    rewind(rewindLatest);
  };

  const apply = (next: RunningOrderDraft, undoMessage?: string): void => {
    const stepId = stepCounter.current + 1;

    stepCounter.current = stepId;

    setState((previous) =>
      previous === null || previous.conflict
        ? previous
        : {
            ...previous,
            draft: { ...next, version: previous.draft.version },
            history: pushStep(previous.history, { stepId, before: previous.draft }),
            revision: previous.revision + 1,
            failed: false,
          },
    );
    if (undoMessage !== undefined) {
      notify({
        tone: 'info',
        message: undoMessage,
        icon: 'undo',
        actions: [
          {
            id: 'undo',
            label: UNDO_LABEL,
            onSelect: () => {
              rewind((history) => rewindTo(history, stepId));
            },
          },
        ],
      });
    }
  };

  const confirm = (confirmed: boolean): void => {
    confirmation.mutate(confirmed, {
      onSuccess: (response) => {
        setState((previous) =>
          previous === null
            ? previous
            : { ...previous, draft: { ...previous.draft, version: response.version } },
        );
      },
    });
  };

  const response = query.data ?? null;
  const exists = response !== null || (state !== null && state.savedRevision > 0);
  const draft = state?.draft ?? EMPTY_DRAFT;

  return {
    isLoading: state === null && query.error === null,
    loadError: state === null ? query.error : null,
    draft,
    findings: reviewRunningOrder(draft),
    exists,
    saveState: saveStateOf(state, exists, saving),
    isDirty,
    confirmedAt: response?.confirmedAt ?? null,
    changedSinceConfirmed: response?.changedSinceConfirmed ?? false,
    isConfirming: confirmation.isPending,
    canUndo: (state?.history.length ?? 0) > 0,
    apply,
    undo,
    reload,
    confirm,
  };
};
