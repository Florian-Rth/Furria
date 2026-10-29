import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { onFootage, PLAYER_LAYER } from '../player-paint';

export const KkStudioDPlayerNote: FC<PropsWithChildren> = ({ children }) => (
  <Typography
    variant="body2"
    role="status"
    data-kk-studio-d-note
    sx={{
      position: 'absolute',
      zIndex: PLAYER_LAYER.overlay,
      left: '50%',
      top: 'calc(50% + 3.5rem)',
      transform: 'translateX(-50%)',
      width: 'max-content',
      maxWidth: '80vw',
      textAlign: 'center',
      fontWeight: 700,
      color: 'text.secondary',
      pointerEvents: 'none',
      ...onFootage,
    }}
  >
    {children}
  </Typography>
);
