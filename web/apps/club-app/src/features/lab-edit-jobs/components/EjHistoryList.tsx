import type { VisitHistory } from '@furria/studio/visit-history';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import { EJ_HISTORY_EMPTY, EJ_HISTORY_LIST } from '../edit-jobs-copy';

interface EjHistoryListProps {
  history: VisitHistory;
}

export const EjHistoryList: FC<EjHistoryListProps> = ({ history }) => {
  if (history.rows.length === 0) {
    return <KkEjPanel.Note text={EJ_HISTORY_EMPTY} />;
  }

  return <KkLaneInspector.Log label={EJ_HISTORY_LIST} rows={history.rows} />;
};
