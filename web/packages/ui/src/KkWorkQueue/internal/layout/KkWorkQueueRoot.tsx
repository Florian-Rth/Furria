import Stack from '@mui/material/Stack';
import { AnimatePresence } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkWorkQueueRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkWorkQueueRoot: FC<KkWorkQueueRootProps> = ({ label, sx, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    data-kk-work-queue
    sx={[
      {
        m: 0,
        p: 0,
        listStyle: 'none',
        minWidth: 0,
        bgcolor: 'background.paper',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <AnimatePresence initial={false}>{children}</AnimatePresence>
  </Stack>
);
