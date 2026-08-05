import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import type { FC, PropsWithChildren } from 'react';
import { useFormContext } from 'react-hook-form';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

export const ApplyConsentCheckbox: FC<PropsWithChildren> = ({ children }) => {
  const { register, formState } = useFormContext<MembershipApplicationForm>();
  const { ref, ...field } = register('consent');
  const error = formState.errors.consent;

  return (
    <FormControl error={error !== undefined} data-kk-apply-consent>
      <FormControlLabel
        label={children}
        required={false}
        sx={{ alignItems: 'flex-start', gap: 1, m: 0 }}
        control={<Checkbox {...field} slotProps={{ input: { ref } }} required sx={{ mt: -1 }} />}
      />
      {error !== undefined && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
};
