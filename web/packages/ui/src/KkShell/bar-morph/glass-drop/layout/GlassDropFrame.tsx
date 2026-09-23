import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

const VEIL = {
  '& [data-kk-shell-bar-mark]:not([data-kk-glass-drop-layer] *) > *': { opacity: 0 },
};

interface GlassDropFrameProps extends PropsWithChildren {
  veiled: boolean;
}

export const GlassDropFrame: FC<GlassDropFrameProps> = ({ veiled, children }) => {
  const veil = veiled ? VEIL : {};

  return (
    <Stack
      direction="row"
      data-kk-glass-drop
      sx={{ position: 'relative', flex: 1, minWidth: 0, alignItems: 'center', ...veil }}
    >
      {children}
    </Stack>
  );
};
