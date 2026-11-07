import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';

interface EjSwitchSectionProps {
  title: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const EjSwitchSection: FC<EjSwitchSectionProps> = ({ title, label, checked, onChange }) => (
  <KkEjPanel.Group label={title}>
    <KkEjPanel.GroupHead text={title} aside={null} />
    <KkSwitchRow label={label} checked={checked} onChange={onChange} />
  </KkEjPanel.Group>
);
