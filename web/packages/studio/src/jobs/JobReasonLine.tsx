import type { JobReason } from '@furria/studio/edit-jobs';
import { reasonsOf } from '@furria/studio/edit-jobs';
import { reasonLineOf } from '@furria/studio/edit-jobs-copy';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';

interface JobReasonLineProps {
  actions: readonly { disabled: boolean; reason: JobReason | null }[];
}

export const JobReasonLine: FC<JobReasonLineProps> = ({ actions }) => {
  const text = reasonLineOf(reasonsOf(actions));

  if (text === null) {
    return null;
  }

  return <KkEjPanel.Note text={text} />;
};
