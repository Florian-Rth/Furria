import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { FC } from 'react';
import type { PublicGroup } from '@/lib/public-groups/schemas';

interface ApplyInterestChoiceProps {
  group: PublicGroup;
  selected: number[];
  onToggle: (groupId: number) => void;
}

export const ApplyInterestChoice: FC<ApplyInterestChoiceProps> = ({
  group,
  selected,
  onToggle,
}) => {
  const isSelected = selected.includes(group.groupId);
  const handleToggle = (): void => {
    onToggle(group.groupId);
  };

  return (
    <FormControlLabel
      label={group.name}
      control={<Checkbox checked={isSelected} onChange={handleToggle} />}
    />
  );
};
