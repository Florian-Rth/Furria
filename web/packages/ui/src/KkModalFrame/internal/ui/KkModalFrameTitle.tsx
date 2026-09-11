import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

interface KkModalFrameTitleProps extends PropsWithChildren {
  id: string;
}

export const KkModalFrameTitle: FC<KkModalFrameTitleProps> = ({ id, children }) => (
  <Typography
    id={id}
    component="h2"
    variant="h5"
    data-kk-modal-frame-title
    sx={{ lineHeight: 1.1, textTransform: 'uppercase', textWrap: 'balance' }}
  >
    {children}
  </Typography>
);
