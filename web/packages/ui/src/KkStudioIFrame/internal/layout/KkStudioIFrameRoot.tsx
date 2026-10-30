import Box from '@mui/material/Box';
import type { FC, PointerEventHandler, PropsWithChildren } from 'react';

export interface KkStudioIFrameSurface {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
}

interface KkStudioIFrameRootProps extends PropsWithChildren {
  label: string;
  surface?: KkStudioIFrameSurface;
}

export const KkStudioIFrameRoot: FC<KkStudioIFrameRootProps> = ({ label, surface, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-studio-i-frame
    {...surface}
    sx={{
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
      width: '100%',
      height: '100%',
      touchAction: 'pan-y',
    }}
  >
    {children}
  </Box>
);
