import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const OlderSessionRowList: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-older-session-rows divider={<Divider />}>
    {children}
  </Stack>
);
