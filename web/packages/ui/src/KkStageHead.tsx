import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from './tokens';

export const KkStageHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    aria-live="polite"
    data-kk-stage-head
    sx={{ flexShrink: 0, alignItems: 'center', minWidth: 0, minHeight: kkTokens.tapTarget }}
  >
    {children}
  </Stack>
);
