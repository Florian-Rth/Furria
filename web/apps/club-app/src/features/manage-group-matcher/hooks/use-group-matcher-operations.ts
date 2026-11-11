import { useState } from 'react';
import {
  useApproveStatementMutation,
  useDeleteStatementMutation,
  useRejectStatementMutation,
  useReorderStatementsMutation,
  useRewordStatementMutation,
} from '../api';
import type { GroupMatcherPane } from '../statement-pool';

export interface GroupMatcherOperations {
  deleteTarget: number | null;
  isReviewing: boolean;
  isRewording: boolean;
  approve: (statementId: number, text: string | null) => void;
  reject: (statementId: number) => void;
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
  const approval = useApproveStatementMutation();
  const rejection = useRejectStatementMutation();
  const rewording = useRewordStatementMutation();
  const ordering = useReorderStatementsMutation();
  const deletion = useDeleteStatementMutation();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const closeWhenShown = (statementId: number): void => {
    if (pane?.statementId === statementId) {
      closePane();
    }
  };

  const approve = (statementId: number, text: string | null): void => {
    approval.mutate({ statementId, text });
    closeWhenShown(statementId);
  };

  const reject = (statementId: number): void => {
    rejection.mutate(statementId);
    closeWhenShown(statementId);
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
    isReviewing: approval.isPending || rejection.isPending,
    isRewording: rewording.isPending,
    approve,
    reject,
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
