import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';
import { useStickyBarHeight } from './use-sticky-bar-height';

interface KkStickyBarProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkStickyBar: FC<KkStickyBarProps> = ({ sx, children }) => {
  const barRef = useStickyBarHeight();

  return (
    <Stack
      ref={barRef}
      data-kk-sticky-bar
      sx={[
        {
          position: 'sticky',
          top: 0,
          zIndex: kkTokens.layout.stickyBarZ,
          minWidth: 0,
          gap: kkTokens.layout.stickyBarGap,
          pt: kkTokens.layout.stickyBarPadY,
          pb: kkTokens.layout.stickyBarPadY,
          bgcolor: 'background.default',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Stack>
  );
};
