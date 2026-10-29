import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { GUTTER_WIDTH, NUMBER_WIDTH } from './numbered-list-paint';

export const KkNumberedListEmpty: FC<PropsWithChildren> = ({ children }) => (
  <Box
    component="li"
    data-kk-numbered-line
    sx={{
      minWidth: 0,
      py: 1.5,
      pr: 2,
      pl: `calc(${GUTTER_WIDTH} + ${NUMBER_WIDTH} + 0.625rem)`,
      typography: 'body2',
      fontWeight: 600,
      color: 'text.secondary',
    }}
  >
    {children}
  </Box>
);
