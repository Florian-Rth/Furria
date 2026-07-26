import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkCardMediaProps extends PropsWithChildren {
  aspectRatio?: string;
}

export const KkCardMedia: FC<KkCardMediaProps> = ({
  aspectRatio = kkTokens.aspectRatio.banner,
  children,
}) => (
  <Box data-kk-card-media sx={{ position: 'relative', width: '100%', aspectRatio, flexShrink: 0 }}>
    {children}
  </Box>
);
