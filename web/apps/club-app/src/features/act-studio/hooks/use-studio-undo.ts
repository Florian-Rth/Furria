import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import { useKkNotice } from '@furria/ui/KkNotice';
import { useQueryClient } from '@tanstack/react-query';
import type { ActStudioResponse, Studio } from '@/features/acts/schemas';
import { useApiMutation } from '@/lib/api/api-mutation';
import { queryKeys } from '@/lib/query/reads';
import type { StudioHistoryEntry } from '../studio-history';
import {
  flippedIn,
  nextRedoOf,
  nextUndoOf,
  recordedIn,
  remappedIn,
  stuckIn,
  withBusy,
} from '../studio-history';
import { changeHistory, historyOf, nextEntryId } from '../studio-history-store';
import { renameOf } from '../studio-remap';
import type { StudioWrite } from '../studio-undo';
import { inverseOf, leadKindOf } from '../studio-undo';
import {
  REDO_LABEL,
  redoneTextOf,
  UNDO_GROUP,
  UNDO_LABEL,
  undoneTextOf,
  WRITE_TEXT,
} from '../undo-copy';
import { performStudioWrite } from '../undo-requests';
import { useStudioWriteFailure } from './use-studio-write-failure';

interface Replay {
  write: StudioWrite;
  studio: Studio;
}

export interface StudioUndo {
  remember: () => Studio | null;
  record: (
    before: Studio | null | undefined,
    write: StudioWrite,
    created?: readonly number[],
    eventId?: number | null,
  ) => void;
  undoable: <TInput, TResult>(
    writeOf: (input: TInput) => StudioWrite,
    createdOf?: (result: TResult) => readonly number[],
  ) => UndoableHooks<TInput, TResult>;
  undo: () => void;
  redo: () => void;
}

export interface UndoableHooks<TInput, TResult> {
  remember: (input: TInput) => Studio | null;
  afterSuccess: (result: TResult, input: TInput, before: Studio | null | undefined) => void;
}

const NONE: readonly number[] = [];

export const useStudioUndo = (actId: number): StudioUndo => {
  const queryClient = useQueryClient();
  const raise = useKkNotice();
  const failure = useStudioWriteFailure(actId);
  const studioKey = queryKeys.actStudio(actId);
  const cachedStudio = (): Studio | null =>
    queryClient.getQueryData<ActStudioResponse>(studioKey)?.studio ?? null;
  const replay = useApiMutation({
    request: ({ write, studio }: Replay, accessToken) =>
      performStudioWrite(actId, write, studio, accessToken),
    changes: ['actMusic', 'actSteps', 'actVideos', 'actChoreography', 'actEvening'],
    notice: failure,
    key: ['actUndo', actId],
  });

  const flipNotice = (entry: StudioHistoryEntry, undoing: boolean): KkNoticeRequest => ({
    tone: 'info',
    icon: 'undo',
    group: UNDO_GROUP,
    message: undoing ? undoneTextOf(entry.kind) : redoneTextOf(entry.kind),
    actions: [
      {
        id: undoing ? 'redo' : 'undo',
        label: undoing ? REDO_LABEL : UNDO_LABEL,
        onSelect: () => {
          const latest = historyOf(actId);
          const next = undoing ? nextRedoOf(latest) : nextUndoOf(latest);
          if (next?.id === entry.id) {
            flip(next);
          }
        },
      },
    ],
  });

  const flip = (entry: StudioHistoryEntry): void => {
    const studio = cachedStudio();
    const write = entry.reverse;
    if (studio === null || write === null || historyOf(actId).busy) {
      return;
    }

    const undoing = entry.state === 'done';
    changeHistory(actId, (current) => withBusy(current, true));
    void replay
      .mutateAsync({ write, studio })
      .then((created) => {
        changeHistory(actId, (current) =>
          remappedIn(
            flippedIn(current, entry.id, inverseOf(studio, write, created)),
            renameOf(entry.applied, created),
          ),
        );
        raise(flipNotice(entry, undoing));
      })
      .catch(() => {
        changeHistory(actId, (current) => stuckIn(current, entry.id));
        void queryClient.invalidateQueries({ queryKey: studioKey });
      })
      .finally(() => {
        changeHistory(actId, (current) => withBusy(current, false));
      });
  };

  const record: StudioUndo['record'] = (before, write, created = NONE, eventId = null) => {
    if (before === null || before === undefined) {
      return;
    }

    const entry: StudioHistoryEntry = {
      id: nextEntryId(),
      kind: leadKindOf(write),
      eventId,
      at: new Date().toISOString(),
      state: 'done',
      applied: write,
      reverse: historyOf(actId).busy ? null : inverseOf(before, write, created),
    };
    changeHistory(actId, (current) => recordedIn(current, entry));
    if (entry.reverse === null) {
      return;
    }

    raise({
      tone: 'info',
      icon: 'undo',
      group: UNDO_GROUP,
      message: WRITE_TEXT[entry.kind],
      actions: [
        {
          id: 'undo',
          label: UNDO_LABEL,
          onSelect: () => {
            const next = nextUndoOf(historyOf(actId));
            if (next?.id === entry.id) {
              flip(next);
            }
          },
        },
      ],
    });
  };

  return {
    remember: cachedStudio,
    record,
    undoable: (writeOf, createdOf) => ({
      remember: cachedStudio,
      afterSuccess: (result, input, before) => {
        record(before, writeOf(input), createdOf?.(result) ?? NONE);
      },
    }),
    undo: () => {
      const entry = nextUndoOf(historyOf(actId));
      if (entry !== null) {
        flip(entry);
      }
    },
    redo: () => {
      const entry = nextRedoOf(historyOf(actId));
      if (entry !== null) {
        flip(entry);
      }
    },
  };
};
