import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkAgendaActsProps extends PropsWithChildren {
  label: string;
}

export const KkAgendaActs: FC<KkAgendaActsProps> = ({ label, children }) => (
  <Stack component="ul" aria-label={label} sx={{ m: 0, p: 0, minWidth: 0 }}>
    {children}
  </Stack>
);
