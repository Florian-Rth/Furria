import { JOB_HISTORY_EMPTY, JOB_HISTORY_LIST } from '@furria/studio/job-copy';
import type { VisitHistory } from '@furria/studio/visit-history';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface JobHistoryListProps {
  history: VisitHistory;
}

export const JobHistoryList: FC<JobHistoryListProps> = ({ history }) => {
  if (history.rows.length === 0) {
    return <KkJobPanel.Note text={JOB_HISTORY_EMPTY} />;
  }

  return <KkLaneInspector.Log label={JOB_HISTORY_LIST} rows={history.rows} />;
};
