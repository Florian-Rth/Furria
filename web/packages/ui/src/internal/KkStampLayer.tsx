import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

export const KkStampLayer: FC<PropsWithChildren> = ({ children }) =>
  createPortal(
    <Stack
      aria-hidden
      data-kk-stamp-layer
      sx={(theme) => ({
        position: 'fixed',
        inset: 0,
        px: 2,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: theme.zIndex.snackbar,
      })}
    >
      {children}
    </Stack>,
    document.body,
  );
