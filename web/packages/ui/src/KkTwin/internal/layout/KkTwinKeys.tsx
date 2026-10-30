import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { TWIN_TIGHT_GAP } from '../twin-query';

export const KkTwinKeys: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-twin-keys
    sx={{
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: TWIN_TIGHT_GAP,
      minWidth: 0,
    }}
  >
    {children}
  </Stack>
);
