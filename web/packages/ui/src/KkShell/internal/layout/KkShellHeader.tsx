import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkScreenHeaderKind } from '../../screen-declaration';
import { headerMotionOf } from '../logic/header-motion';
import { useKkShell } from '../logic/shell-context';

const HEADER_GAP = 1.25;

interface KkShellHeaderProps extends PropsWithChildren {
  kind: KkScreenHeaderKind;
}

export const KkShellHeader: FC<KkShellHeaderProps> = ({ kind, children }) => {
  const { handover } = useKkShell();
  const motion = headerMotionOf(kind, handover);

  if (children === undefined || children === null) {
    return null;
  }

  return (
    <Stack
      data-kk-shell-header
      sx={{
        minWidth: 0,
        gap: HEADER_GAP,
        opacity: motion.opacity,
        transform: `translateY(${motion.drift}px)`,
        pointerEvents: 'none',
      }}
    >
      {children}
    </Stack>
  );
};
