import type { JobAction } from '@furria/studio/job-view';
import { KkPillButton } from '@furria/ui/KkPillButton';
import type { FC } from 'react';

interface JobActionButtonProps {
  action: JobAction;
}

export const JobActionButton: FC<JobActionButtonProps> = ({ action }) => (
  <KkPillButton
    text={action.text}
    glyph={action.glyph}
    tone={action.tone}
    label={action.label}
    pressed={action.pressed}
    disabled={action.disabled}
    onPress={action.press}
  />
);
