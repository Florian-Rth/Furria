import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../../tokens';

const MARK_GAP = 0.25;

export const GlassDropGhostLayer: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    aria-hidden
    data-kk-glass-drop-ghost
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: `calc(${kkTokens.tapTarget} + ${theme.spacing(MARK_GAP)})`,
      justifyContent: 'center',
      minWidth: 0,
      pointerEvents: 'none',
    })}
  >
    {children}
  </Stack>
);
