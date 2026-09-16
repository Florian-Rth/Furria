import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { useKkShell } from '../logic/shell-context';

const HEADER_GAP = 1.25;

export const KkShellHeader: FC<PropsWithChildren> = ({ children }) => {
  const { handover } = useKkShell();

  if (children === undefined || children === null) {
    return null;
  }

  return (
    <Stack
      data-kk-shell-header
      sx={{
        minWidth: 0,
        gap: HEADER_GAP,
        opacity: handover.headerOpacity,
        transform: `translateY(${handover.headerDrift}px)`,
        pointerEvents: 'none',
      }}
    >
      {children}
    </Stack>
  );
};
