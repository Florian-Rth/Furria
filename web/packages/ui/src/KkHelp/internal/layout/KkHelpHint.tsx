import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { HELP_COUNTER } from '../logic/help-counter';

export const KkHelpHint: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="li"
    data-kk-help-hint
    sx={{ gap: 0.75, minWidth: 0, counterIncrement: HELP_COUNTER }}
  >
    {children}
  </Stack>
);
