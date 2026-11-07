import { EJ_HISTORY_EMPTY, EJ_HISTORY_LIST } from '@furria/studio/edit-jobs-copy';
import type { VisitHistory } from '@furria/studio/visit-history';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface JobHistoryListProps {
  history: VisitHistory;
}

export const JobHistoryList: FC<JobHistoryListProps> = ({ history }) => {
  if (history.rows.length === 0) {
    return <KkEjPanel.Note text={EJ_HISTORY_EMPTY} />;
  }

  return <KkLaneInspector.Log label={EJ_HISTORY_LIST} rows={history.rows} />;
};
