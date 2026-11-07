import { JobHistoryList } from '@furria/studio/JobHistoryList';
import { JOB_HISTORY_VISIT } from '@furria/studio/job-copy';
import type { VisitHistory } from '@furria/studio/visit-history';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import type { FC, ReactNode } from 'react';

interface JobHistoryPanelProps {
  history: VisitHistory;
  versions: ReactNode;
}

export const JobHistoryPanel: FC<JobHistoryPanelProps> = ({ history, versions }) => (
  <>
    <KkJobPanel.Group label={JOB_HISTORY_VISIT}>
      <KkJobPanel.GroupHead text={JOB_HISTORY_VISIT} aside={null} />
      <JobHistoryList history={history} />
    </KkJobPanel.Group>
    {versions}
  </>
);
