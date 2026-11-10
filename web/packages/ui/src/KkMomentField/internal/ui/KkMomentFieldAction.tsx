import type { FC } from 'react';
import { KkButton } from '../../../KkButton';

interface KkMomentFieldActionProps {
  label: string;
  onSelect: () => void;
}

export const KkMomentFieldAction: FC<KkMomentFieldActionProps> = ({ label, onSelect }) => (
  <KkButton variant="text" size="small" onClick={onSelect}>
    {label}
  </KkButton>
);
