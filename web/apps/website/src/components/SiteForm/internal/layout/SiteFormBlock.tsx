import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const SiteFormBlock: FC<PropsWithChildren> = ({ children }) => (
  <Box
    component="fieldset"
    data-kk-site-form-block
    sx={{ border: 'none', minWidth: 0, m: 0, p: 0 }}
  >
    {children}
  </Box>
);
