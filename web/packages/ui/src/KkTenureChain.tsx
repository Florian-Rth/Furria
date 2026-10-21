import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';

interface KkTenureChainProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkTenureChain: FC<KkTenureChainProps> = ({ label, sx, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    data-kk-tenure-chain
    sx={[{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
