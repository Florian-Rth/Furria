import { useState } from 'react';
import {
  useAddStatementMutation,
  useDeleteStatementMutation,
  useReorderStatementsMutation,
  useRewordStatementMutation,
} from '../api';
import type { GroupMatcherPane } from '../statement-pool';

export interface GroupMatcherOperations {
  deleteTarget: number | null;
  isAdding: boolean;
  isRewording: boolean;
  add: (text: string, onFailed: () => void) => void;
  reword: (statementId: number, text: string) => void;
  reorder: (statementIds: readonly number[]) => void;
  askDelete: (statementId: number) => void;
  keepStatement: () => void;
  confirmDelete: () => void;
}

export const useGroupMatcherOperations = (
  pane: GroupMatcherPane | null,
  closePane: () => void,
): GroupMatcherOperations => {
  const addition = useAddStatementMutation();
  const rewording = useRewordStatementMutation();
  const ordering = useReorderStatementsMutation();
  const deletion = useDeleteStatementMutation();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const closeWhenShown = (statementId: number): void => {
    if (pane?.statementId === statementId) {
      closePane();
    }
  };

  const add = (text: string, onFailed: () => void): void => {
    const addedAt = new Date().toISOString();

    addition.mutate({ provisionalId: -Date.now(), text, addedAt }, { onError: onFailed });
  };

  const confirmDelete = (): void => {
    if (deleteTarget === null) {
      return;
    }

    deletion.mutate(deleteTarget);
    closeWhenShown(deleteTarget);
    setDeleteTarget(null);
  };

  return {
    deleteTarget,
    isAdding: addition.isPending,
    isRewording: rewording.isPending,
    add,
    reword: (statementId, text) => {
      rewording.mutate({ statementId, text });
    },
    reorder: (statementIds) => {
      ordering.mutate(statementIds);
    },
    askDelete: setDeleteTarget,
    keepStatement: () => {
      setDeleteTarget(null);
    },
    confirmDelete,
  };
};
