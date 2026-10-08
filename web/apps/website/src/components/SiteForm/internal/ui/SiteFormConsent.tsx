import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import type { FC, PropsWithChildren } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface SiteFormConsentProps extends PropsWithChildren {
  registration: UseFormRegisterReturn;
  error: FieldError | undefined;
}

export const SiteFormConsent: FC<SiteFormConsentProps> = ({ registration, error, children }) => {
  const { ref, ...field } = registration;

  return (
    <FormControl error={error !== undefined} data-kk-site-form-consent>
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
