import FormGroup from '@mui/material/FormGroup';
import type { FC } from 'react';
import type { Group } from '@/lib/seed/groups';
import { ApplyInterestChoice } from './ApplyInterestChoice';

interface ApplyInterestChoicesProps {
  groups: Group[];
}

export const ApplyInterestChoices: FC<ApplyInterestChoicesProps> = ({ groups }) => (
  <FormGroup data-kk-apply-interests sx={{ gap: 0.5 }}>
    {groups.map((group) => (
      <ApplyInterestChoice key={group.id} group={group} />
    ))}
  </FormGroup>
);
