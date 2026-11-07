import { EJ_COPY_NEXT, EJ_COPY_PREVIOUS } from '@furria/studio/edit-jobs-copy';
import type { JobCopyPick } from '@furria/studio/edit-jobs-view';
import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';

interface JobCopySectionProps {
  title: string;
  pick: JobCopyPick;
}

export const JobCopySection: FC<JobCopySectionProps> = ({ title, pick }) => (
  <KkEjPanel.Group label={title}>
    <KkEjPanel.GroupHead text={title} aside={null} />
    <KkEjPanel.Tools>
      <KkEjButton
        text={EJ_COPY_PREVIOUS}
        glyph="previous"
        textShown={false}
        disabled={pick.previousLocked}
        onPress={pick.previous}
      />
      <KkEjButton
        text={pick.action.text}
        glyph={pick.action.glyph}
        label={pick.action.label}
        tone={pick.action.tone}
        onPress={pick.action.press}
      />
      <KkEjButton
        text={EJ_COPY_NEXT}
        glyph="next"
        textShown={false}
        disabled={pick.nextLocked}
        onPress={pick.next}
      />
    </KkEjPanel.Tools>
  </KkEjPanel.Group>
);
