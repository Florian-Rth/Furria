import { EJ_HISTORY_VISIT } from '@furria/studio/edit-jobs-copy';
import { JobHistoryList } from '@furria/studio/JobHistoryList';
import type { VisitHistory } from '@furria/studio/visit-history';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC, ReactNode } from 'react';

interface JobHistoryPanelProps {
  history: VisitHistory;
  versions: ReactNode;
}

export const JobHistoryPanel: FC<JobHistoryPanelProps> = ({ history, versions }) => (
  <>
    <KkEjPanel.Group label={EJ_HISTORY_VISIT}>
      <KkEjPanel.GroupHead text={EJ_HISTORY_VISIT} aside={null} />
      <JobHistoryList history={history} />
    </KkEjPanel.Group>
    {versions}
  </>
);
