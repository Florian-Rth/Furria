import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkLaneFilmRootProps extends PropsWithChildren {
  label: string;
}

export const KkLaneFilmRoot: FC<KkLaneFilmRootProps> = ({ label, children }) => (
  <Box
    component="figure"
    aria-label={label}
    data-kk-lane-film
    sx={{
      position: 'relative',
      m: 0,
      width: '100%',
      aspectRatio: '16 / 9',
      maxHeight: '34cqh',
      minHeight: 0,
      borderRadius: `${kkTokens.radius.base}px`,
      bgcolor: kkTokens.overlay.scrimInk,
      color: kkTokens.overlay.onPhotoText,
      overflow: 'clip',
    }}
  >
    {children}
  </Box>
);
