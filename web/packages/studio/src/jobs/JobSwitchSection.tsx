import { KkJobPanel } from '@furria/ui/KkJobPanel';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';

interface JobSwitchSectionProps {
  title: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const JobSwitchSection: FC<JobSwitchSectionProps> = ({
  title,
  label,
  checked,
  onChange,
}) => (
  <KkJobPanel.Group label={title}>
    <KkJobPanel.GroupHead text={title} aside={null} />
    <KkSwitchRow label={label} checked={checked} onChange={onChange} />
  </KkJobPanel.Group>
);
