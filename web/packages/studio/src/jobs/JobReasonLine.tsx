import { reasonLineOf } from '@furria/studio/job-copy';
import type { JobReason } from '@furria/studio/job-model';
import { reasonsOf } from '@furria/studio/job-model';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import type { FC } from 'react';

interface JobReasonLineProps {
  actions: readonly { disabled: boolean; reason: JobReason | null }[];
}

export const JobReasonLine: FC<JobReasonLineProps> = ({ actions }) => {
  const text = reasonLineOf(reasonsOf(actions));

  if (text === null) {
    return null;
  }

  return <KkJobPanel.Note text={text} />;
};
