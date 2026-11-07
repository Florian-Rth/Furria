import { JOB_COPY_NEXT, JOB_COPY_PREVIOUS } from '@furria/studio/job-copy';
import type { JobCopyPick } from '@furria/studio/job-view';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import { KkPillButton } from '@furria/ui/KkPillButton';
import type { FC } from 'react';

interface JobCopySectionProps {
  title: string;
  pick: JobCopyPick;
}

export const JobCopySection: FC<JobCopySectionProps> = ({ title, pick }) => (
  <KkJobPanel.Group label={title}>
    <KkJobPanel.GroupHead text={title} aside={null} />
    <KkJobPanel.Tools>
      <KkPillButton
        text={JOB_COPY_PREVIOUS}
        glyph="left"
        textShown={false}
        disabled={pick.previousLocked}
        onPress={pick.previous}
      />
      <KkPillButton
        text={pick.action.text}
        glyph={pick.action.glyph}
        label={pick.action.label}
        tone={pick.action.tone}
        onPress={pick.action.press}
      />
      <KkPillButton
        text={JOB_COPY_NEXT}
        glyph="right"
        textShown={false}
        disabled={pick.nextLocked}
        onPress={pick.next}
      />
    </KkJobPanel.Tools>
  </KkJobPanel.Group>
);
