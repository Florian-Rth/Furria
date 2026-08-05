import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { FC } from 'react';
import type { Group } from '@/lib/seed/groups';

interface ApplyInterestChoiceProps {
  group: Group;
  selected: string[];
  onToggle: (groupId: string) => void;
}

export const ApplyInterestChoice: FC<ApplyInterestChoiceProps> = ({
  group,
  selected,
  onToggle,
}) => {
  const isSelected = selected.includes(group.id);
  const handleToggle = (): void => {
    onToggle(group.id);
  };

  return (
    <FormControlLabel
      label={group.name}
      control={<Checkbox checked={isSelected} onChange={handleToggle} />}
    />
  );
};
