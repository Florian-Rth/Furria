import Stack from '@mui/material/Stack';
import { AnimatePresence, LayoutGroup, MotionConfig } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStudioBManualRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioBManualRoot: FC<KkStudioBManualRootProps> = ({ label, sx, children }) => (
  <MotionConfig reducedMotion="user">
    <LayoutGroup>
      <Stack
        component="ol"
        aria-label={label}
        data-kk-studio-b-manual
        sx={[
          { m: 0, p: 0, listStyle: 'none', minWidth: 0, position: 'relative' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {children}
        </AnimatePresence>
      </Stack>
    </LayoutGroup>
  </MotionConfig>
);
