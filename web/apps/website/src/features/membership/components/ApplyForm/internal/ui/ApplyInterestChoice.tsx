import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { toggleGroupInterest } from '@/features/membership/group-interests';
import type { MembershipApplicationForm } from '@/features/membership/schemas';
import type { Group } from '@/lib/seed/groups';

interface ApplyInterestChoiceProps {
  group: Group;
}

export const ApplyInterestChoice: FC<ApplyInterestChoiceProps> = ({ group }) => {
  const { setValue, watch } = useFormContext<MembershipApplicationForm>();
  const selected = watch('groupInterests');
  const isSelected = selected.includes(group.id);
  const handleToggle = (): void => {
    setValue('groupInterests', toggleGroupInterest(selected, group.id), { shouldDirty: true });
  };

  return (
    <FormControlLabel
      label={group.name}
      control={<Checkbox checked={isSelected} onChange={handleToggle} />}
    />
  );
};
