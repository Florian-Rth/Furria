import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

const HONEYPOT_PLACEHOLDER = 'Dieses Feld bitte leer lassen';

interface SiteFormHoneypotProps {
  registration: UseFormRegisterReturn;
}

export const SiteFormHoneypot: FC<SiteFormHoneypotProps> = ({ registration }) => (
  <Box
    component="input"
    {...registration}
    type="text"
    aria-hidden
    tabIndex={-1}
    autoComplete="off"
    placeholder={HONEYPOT_PLACEHOLDER}
    sx={{ position: 'absolute', left: '-100vw', width: '1rem', height: '1rem', opacity: 0 }}
  />
);
