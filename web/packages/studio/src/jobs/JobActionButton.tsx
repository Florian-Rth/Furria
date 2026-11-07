import type { JobAction } from '@furria/studio/edit-jobs-view';
import { KkEjButton } from '@furria/ui/KkEjButton';
import type { FC } from 'react';

interface JobActionButtonProps {
  action: JobAction;
}

export const JobActionButton: FC<JobActionButtonProps> = ({ action }) => (
  <KkEjButton
    text={action.text}
    glyph={action.glyph}
    tone={action.tone}
    label={action.label}
    pressed={action.pressed}
    disabled={action.disabled}
    onPress={action.press}
  />
);
