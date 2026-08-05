import FormGroup from '@mui/material/FormGroup';
import type { FC } from 'react';
import { useGroupInterestsField } from '@/features/membership/hooks/use-group-interests-field';
import type { Group } from '@/lib/seed/groups';
import { ApplyInterestChoice } from './ApplyInterestChoice';

interface ApplyInterestChoicesProps {
  groups: Group[];
}

export const ApplyInterestChoices: FC<ApplyInterestChoicesProps> = ({ groups }) => {
  const { selected, toggle } = useGroupInterestsField();

  return (
    <FormGroup data-kk-apply-interests sx={{ gap: 0.5 }}>
      {groups.map((group) => (
        <ApplyInterestChoice key={group.id} group={group} selected={selected} onToggle={toggle} />
      ))}
    </FormGroup>
  );
};
