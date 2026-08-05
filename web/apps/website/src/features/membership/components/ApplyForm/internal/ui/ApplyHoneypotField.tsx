import Box from '@mui/material/Box';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { applyHoneypotLabel } from '@/features/membership/apply-content';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

export const ApplyHoneypotField: FC = () => {
  const { register } = useFormContext<MembershipApplicationForm>();

  return (
    <Box
      component="input"
      {...register('honeypot')}
      type="text"
      aria-hidden
      tabIndex={-1}
      autoComplete="off"
      placeholder={applyHoneypotLabel}
      sx={{ position: 'absolute', left: '-100vw', width: '1rem', height: '1rem', opacity: 0 }}
    />
  );
};
