import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const ChangelogPanelColumn: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
);
