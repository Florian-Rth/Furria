import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import { EJ_COPY_NEXT, EJ_COPY_PREVIOUS } from '../edit-jobs-copy';
import type { EjCopyPick } from '../edit-jobs-view';

interface EjCopySectionProps {
  title: string;
  pick: EjCopyPick;
}

export const EjCopySection: FC<EjCopySectionProps> = ({ title, pick }) => (
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
