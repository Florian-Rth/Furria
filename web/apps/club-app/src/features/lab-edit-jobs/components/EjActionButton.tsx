import { KkEjButton } from '@furria/ui/KkEjButton';
import type { FC } from 'react';
import type { EjAction } from '../edit-jobs-view';

interface EjActionButtonProps {
  action: EjAction;
}

export const EjActionButton: FC<EjActionButtonProps> = ({ action }) => (
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
