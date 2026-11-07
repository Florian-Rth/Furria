import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from './tokens';

export const KkEjStageHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    aria-live="polite"
    data-kk-ej-stage-head
    sx={{ flexShrink: 0, alignItems: 'center', minWidth: 0, minHeight: kkTokens.tapTarget }}
  >
    {children}
  </Stack>
);
