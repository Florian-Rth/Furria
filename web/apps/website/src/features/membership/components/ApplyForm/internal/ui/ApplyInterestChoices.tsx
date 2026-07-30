import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { toggleGroupInterest } from '@/features/membership/group-interests';
import type { MembershipApplicationForm } from '@/features/membership/schemas';
import type { Group } from '@/lib/seed/groups';

interface ApplyInterestChoicesProps {
  groups: Group[];
}

export const ApplyInterestChoices: FC<ApplyInterestChoicesProps> = ({ groups }) => {
  const { setValue, watch } = useFormContext<MembershipApplicationForm>();
  const selected = watch('groupInterests');

  return (
    <FormGroup data-kk-apply-interests sx={{ gap: 0.5 }}>
      {groups.map((group) => {
        const isSelected = selected.includes(group.id);

        return (
          <FormControlLabel
            key={group.id}
            label={group.name}
            control={
              <Checkbox
                checked={isSelected}
                onChange={() =>
                  setValue('groupInterests', toggleGroupInterest(selected, group.id), {
                    shouldDirty: true,
                  })
                }
              />
            }
          />
        );
      })}
    </FormGroup>
  );
};
